---
title: "Configuring Spring Cloud OpenFeign the proper way"
date: "2025-12-24"
tags: [ "java", "spring", "spring cloud", "openfeign", "preview" ]
author: 'Abissens'
git:  https://github.com/elethought-courses/spring-cloud-openfeign-config.git
---
Spring Cloud OpenFeign is the go-to choice for declarative HTTP clients in Spring applications. It integrates well with
Spring and Spring Cloud features and is highly configurable—I've rarely heard of a team regretting the move from
RestTemplate. But for teams starting their journey with Spring Cloud OpenFeign, some common issues promptly arise:
Why is there no out-of-the-box proxy configuration? Why do some custom client configurations apply to all clients?
What HTTP client library am I actually using? And my favorite: why can't I parse a 401 response body?

This article explores these questions and provides practical patterns for configuring OpenFeign clients properly.

---

Spring Cloud OpenFeign is the go-to choice for declarative HTTP clients in Spring applications. It integrates well with
Spring and Spring Cloud features and is highly configurable—I've rarely heard of a team regretting the move from
RestTemplate. But for teams starting their journey with Spring Cloud OpenFeign, some common issues promptly arise:
Why is there no out-of-the-box proxy configuration? Why do some custom client configurations apply to all clients?
What HTTP client library am I actually using? And my favorite: why can't I parse a 401 response body?

This article explores these questions and provides practical patterns for configuring OpenFeign clients properly.

First, let's review some Spring Cloud OpenFeign basics.

The framework simplifies HTTP client development by letting you declare service interfaces with annotations
instead of writing boilerplate connection code. You define an interface, annotate it with `@FeignClient`, and Spring
handles the rest—request building, serialization, error handling, and response parsing.

Under the hood, three layers of libraries work together to make this happen:

- **HTTP Client**: The lowest layer handles the actual network communication. Spring Cloud OpenFeign supports
  multiple implementations: the JDK's built-in `HttpURLConnection` (default), Apache HttpClient 5, or Java's
  HTTP/2 Client. Each has different capabilities for connection pooling, proxy configuration, and TLS handling.

- **OpenFeign (Netflix/GitHub)**[^1]: The core library that transforms your annotated interface into a working HTTP
  client. It handles request templating, parameter encoding, response decoding, and error mapping. This layer
  is framework-agnostic and defines the pluggable architecture for HTTP clients, encoders, and decoders.

- **Spring Cloud OpenFeign**[^2]: The Spring integration layer that provides auto-configuration, `application.yml`
  property binding, service discovery integration (Eureka, Consul), and Spring-specific features like
  `@RequestMapping` support. It bridges OpenFeign with the Spring ecosystem.

For teams adopting Spring Cloud OpenFeign, the first decision should be which HTTP client library to use. Each
implementation has its own approach to proxy configuration, TLS customization, and connection management.
Configurations that work seamlessly with one client may be completely ignored by another, leading to frustrating
debugging sessions where "nothing is wrong" but nothing works either.

| Feature             | Default (HttpURLConnection) | Apache HttpClient 5 | Java HTTP/2 Client | OkHttp[^3]     |
|---------------------|-----------------------------|---------------------|--------------------|----------------|
| Dependencies        | None (JDK built-in)         | `feign-hc5`         | `feign-java11`     | `feign-okhttp` |
| Connection pooling  | Limited                     | Yes                 | Yes                | Yes            |
| HTTP/2 support      | No                          | Yes                 | Yes (native)       | Yes            |
| Proxy configuration | Via `Client.Proxied`        | Native              | Native             | Native         |
| Custom TLS/SSL      | Limited                     | Full control        | Full control       | Full control   |
| Async support       | No                          | Yes                 | Yes                | Yes            |

### Which client should you choose?

- **Default (HttpURLConnection)**: Suitable only for simple prototypes or environments where adding dependencies is
  restricted. Avoid in production—it lacks connection pooling, has limited TLS customization, and suffers from
  known bugs in error handling[^4].

- **Apache HttpClient 5**[^5]: The safe choice for most production applications. It's battle-tested, offers fine-grained
  control over connections, timeouts, and TLS, and integrates well with enterprise requirements like proxy
  authentication and custom certificate stores. Choose this when reliability and configurability matter.

- **Java HTTP/2 Client**[^6]: A good option if you're on JDK 11+ and want native HTTP/2 support without external
  dependencies. It's lighter than Apache HC5 and suits microservice architectures where HTTP/2 multiplexing
  reduces connection overhead. Choose this for modern, HTTP/2-first environments.

- **OkHttp**: Previously popular for its clean API and performance, but now deprecated at the Spring Framework level.
  Only consider it if you're maintaining an existing codebase that already depends on it.

To enable a specific client, add the corresponding dependency and set the appropriate property:

```yaml
# Apache HttpClient 5 (recommended)
spring.cloud.openfeign.httpclient.hc5.enabled: true

# Java HTTP/2 Client
spring.cloud.openfeign.http2client.enabled: true
```

### Out of the box configurations

Spring Cloud OpenFeign provides a comprehensive set of properties under `spring.cloud.openfeign` that cover most
common configuration needs without writing any Java code.

#### Default configuration for all clients

The `default` configuration applies to every Feign client in your application:

```yaml
spring:
  cloud:
    openfeign:
      client:
        config:
          default:
            connect-timeout: 5000
            read-timeout: 10000
            logger-level: basic
            dismiss404: false
            follow-redirects: true
```

| Property           | Description                                           |
|--------------------|-------------------------------------------------------|
| `connect-timeout`  | Connection timeout in milliseconds                    |
| `read-timeout`     | Read timeout in milliseconds                          |
| `logger-level`     | Logging verbosity: `none`, `basic`, `headers`, `full` |
| `dismiss404`       | Return `null` instead of throwing on 404 responses    |
| `follow-redirects` | Automatically follow HTTP redirects                   |

#### Per-client configuration

Override defaults for specific clients by using the client name as the configuration key. The name must match
the `name` attribute in your `@FeignClient` annotation:

```java
@FeignClient(name = "pokemon-api")
public interface PokeApiClient {
    @GetMapping("/api/v2/pokemon/{name}")
    Pokemon getByName(@PathVariable("name") String name);
}
```

```yaml
spring:
  cloud:
    openfeign:
      client:
        config:
          pokemon-api:
            url: https://pokeapi.co
            connect-timeout: 3000
            read-timeout: 5000
            default-request-headers:
              Accept: application/json
              User-Agent: my-application
```

The `url` property is particularly useful—it lets you externalize the base URL instead of hardcoding it in the
annotation, making environment-specific configuration straightforward.

#### HTTP client pool configuration

For Apache HttpClient 5 (and similar clients), you can tune connection pooling globally:

```yaml
spring:
  cloud:
    openfeign:
      httpclient:
        max-connections: 200
        max-connections-per-route: 50
        time-to-live: 900
        time-to-live-unit: seconds
        connection-timeout: 2000
        follow-redirects: true
        hc5:
          enabled: true
          socket-timeout: 5
          socket-timeout-unit: seconds
          connection-request-timeout: 3
          connection-request-timeout-unit: minutes
          pool-concurrency-policy: strict
          pool-reuse-policy: fifo
```

These settings apply globally to the HTTP client instance shared across all Feign clients using that implementation.

#### What's missing from out-of-the-box configuration?

While these properties cover timeouts, headers, and connection pooling, you'll notice some gaps: no proxy
configuration properties (`proxy.host`, `proxy.port`), no TLS customization (`trust-store`, `key-store`), and
no way to select different HTTP clients per-client. These limitations push teams toward custom configuration
classes—which we'll cover in the next sections.

### Bean customization level configurations

When YAML properties aren't enough, you can define configuration classes that provide custom beans to OpenFeign.
These beans let you customize error handling, add request interceptors, configure retry logic, and more.

#### How OpenFeign uses Spring child contexts

To understand why configuration works the way it does, you need to understand OpenFeign's context architecture.

When Spring processes `@EnableFeignClients`, it doesn't register Feign client beans directly in your main
application context. Instead, it creates a **child ApplicationContext** for each `@FeignClient`[^7]. This child
context has your main context as its parent, enabling per-client isolation.

<Diagram name="feign/feign-context" alt="OpenFeign child context architecture" width={700} height={450} />

When OpenFeign needs a bean like `ErrorDecoder`, it first looks in the client's child context. If not found,
it falls back to the parent (main) application context, and finally to OpenFeign's built-in defaults.

This architecture enables per-client customization: beans in a child context only affect that specific client.
But it also creates a trap—if your configuration class is component-scanned into the parent context, those
beans become the fallback for **all** clients.

The `configuration` attribute in `@FeignClient` tells OpenFeign to register that class in the child context:

```java
@FeignClient(name = "pokemon-api", configuration = MyConfig.class)
```

OpenFeign instantiates `MyConfig` and registers its `@Bean` methods in the child context—not the parent.
This is why `MyConfig` should **not** be annotated with `@Configuration`: you don't want Spring to also
register it in the parent context during component scanning.

> **⚠️ Critical warning**: Configuration classes for Feign clients must **never** be picked up by Spring's
> component scanning. If they are, their beans become global defaults for **all** Feign clients in your
> application—often not what you intended.

#### The global configuration trap

Consider this seemingly innocent setup:

```java
@Configuration  // ❌ WRONG: This makes it a global Spring bean
public class MyFeignConfig {
    @Bean
    ErrorDecoder errorDecoder() {
        return new CustomErrorDecoder();
    }
}
```

If `MyFeignConfig` is in a package scanned by `@SpringBootApplication` or `@ComponentScan`, every Feign client
in your application will use `CustomErrorDecoder`—even clients that should use the default decoder.

**The correct approach**: Don't annotate configuration classes with `@Configuration` or `@Component`, and keep
them outside your component scan path:

```java
// No @Configuration annotation - this is intentional
public class FeignClientConfig {

    @Bean
    ErrorDecoder errorDecoder() {
        return new ErrorDecoder() {
            private final ErrorDecoder defaultDecoder = new ErrorDecoder.Default();

            @Override
            public Exception decode(String methodKey, Response response) {
                int status = response.status();
                if (status >= 400 && status < 500) {
                    return new CustomHttpException(status, methodKey, extractBody(response));
                }
                return defaultDecoder.decode(methodKey, response);
            }

            private String extractBody(Response response) {
                if (response.body() == null) return "";
                try (var is = response.body().asInputStream()) {
                    return new String(is.readAllBytes(), StandardCharsets.UTF_8);
                } catch (IOException e) {
                    return "";
                }
            }
        };
    }
}
```

#### Customizable beans

OpenFeign supports several bean types for customization:

| Bean Type            | Purpose                                                    |
|----------------------|------------------------------------------------------------|
| `ErrorDecoder`       | Transform HTTP errors into custom exceptions               |
| `RequestInterceptor` | Add headers, authentication, or modify requests            |
| `Retryer`            | Configure retry logic for failed requests                  |
| `Logger.Level`       | Set logging verbosity (`NONE`, `BASIC`, `HEADERS`, `FULL`) |
| `Request.Options`    | Override timeouts for this client                          |
| `Client`             | Replace the underlying HTTP client entirely                |

#### Example: Request interceptor for correlation IDs

```java
@Bean
RequestInterceptor correlationIdInterceptor() {
    return template -> {
        if (!template.headers().containsKey("X-Correlation-ID")) {
            template.header("X-Correlation-ID", UUID.randomUUID().toString());
        }
    };
}
```

#### Example: Custom retry with exponential backoff

```java
@Bean
Retryer retryer() {
    return new Retryer() {
        private final int maxAttempts = 3;
        private final long initialBackoffMs = 100;
        private final long maxBackoffMs = 1000;
        private int attempt = 1;

        @Override
        public void continueOrPropagate(RetryableException e) {
            if (attempt >= maxAttempts) throw e;
            long backoff = Math.min(initialBackoffMs * (1L << (attempt - 1)), maxBackoffMs);
            try {
                Thread.sleep(backoff);
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                throw e;
            }
            attempt++;
        }

        @Override
        public Retryer clone() {
            return retryer();
        }
    };
}
```

### Feign client customization level configurations

At this point, you might wonder: why doesn't Spring Cloud OpenFeign provide simple properties like
`spring.cloud.openfeign.client.config.my-client.proxy.host` out of the box?

The answer lies in the abstraction challenge. Each HTTP client library configures proxy and TLS differently:

- **Apache HttpClient 5** uses `HttpRoutePlanner` for proxy and `SSLConnectionSocketFactory` for TLS
- **Java HTTP/2 Client** uses `ProxySelector` and `SSLContext`
- **Default HttpURLConnection** relies on system properties or `Proxy` objects
- **OkHttp** uses its own `Proxy` and `SSLSocketFactory`

Creating a unified abstraction that covers all these APIs while exposing their full capabilities is complex.
Spring Cloud OpenFeign chose to provide the building blocks (child contexts, configuration classes) rather
than a leaky abstraction that would inevitably frustrate advanced users.

#### What we're about to do

To add per-client proxy and TLS configuration, we need to provide our own `Client` bean in the child context.
We want to preserve all default behavior from `FeignHttpClientProperties` (timeouts, connection pooling,
redirects), maintain composability with `HttpClientBuilderCustomizer` beans, and inject our per-client proxy
and TLS settings at the right level.

This means **copying and adapting code from Spring's default configuration classes** like
`HttpClient5FeignConfiguration`[^8]. We're essentially recreating Spring's wiring with our additions.

<Diagram name="feign/feign-hc5-components" alt="FeignApacheHttpClient5Config component dependencies" width={750} height={400} />

The diagram shows how our custom configuration fits into the component hierarchy. We provide beans that would
normally come from Spring's auto-configuration, while still depending on `FeignHttpClientProperties` for
standard settings.

> **Note**: This approach requires understanding the underlying HTTP client library. You're taking over
> responsibility for creating the HTTP client instance that Spring would normally provide.

#### Reading per-client configuration

Spring Cloud OpenFeign exposes the current client name through `${spring.cloud.openfeign.client.name}`.
We use this to read per-client properties from the `Environment`:

```java
public class FeignClientProperties {
    private static final String PREFIX = "spring.cloud.openfeign.client.config.";
    private final Environment env;
    private final String clientName;

    public FeignClientProperties(Environment env, String clientName) {
        this.env = env;
        this.clientName = clientName;
    }

    public boolean isProxyEnabled() {
        return getBoolean("proxy.enabled", false);
    }

    public String getProxyHost() {
        return getString("proxy.host");
    }

    public int getProxyPort() {
        return getInt("proxy.port", 8080);
    }

    // ... tls.enabled, tls.trust-store, tls.trust-store-password, etc.
}
```

#### The configuration class

Here's the configuration class for Apache HttpClient 5. Notice how it mirrors Spring's
`HttpClient5FeignConfiguration` while adding proxy and TLS handling:

```java
public class FeignApacheHttpClient5Config {

    private final FeignClientProperties properties;
    private final ResourceLoader resourceLoader = new DefaultResourceLoader();
    private CloseableHttpClient httpClient5;

    public FeignApacheHttpClient5Config(Environment env,
            @Value("${spring.cloud.openfeign.client.name}") String clientName) {
        this.properties = new FeignClientProperties(env, clientName);
    }

    @Bean
    public Client feignClient(CloseableHttpClient httpClient5) {
        return new ApacheHttp5Client(httpClient5);
    }

    @Bean
    public HttpClientConnectionManager hc5ConnectionManager(
            FeignHttpClientProperties httpClientProperties) {
        var builder = PoolingHttpClientConnectionManagerBuilder.create()
                .setSSLSocketFactory(httpsSSLConnectionSocketFactory(
                    httpClientProperties.isDisableSslValidation()))
                .setMaxConnTotal(httpClientProperties.getMaxConnections())
                .setMaxConnPerRoute(httpClientProperties.getMaxConnectionsPerRoute())
                .setConnPoolPolicy(PoolReusePolicy.valueOf(
                    httpClientProperties.getHc5().getPoolReusePolicy().name()))
                // ... other pool settings from httpClientProperties

        configureTls(builder);  // Our per-client TLS
        return builder.build();
    }

    @Bean
    public CloseableHttpClient httpClient5(
            HttpClientConnectionManager connectionManager,
            FeignHttpClientProperties httpClientProperties,
            ObjectProvider<List<HttpClientBuilderCustomizer>> customizerProvider) {

        var builder = HttpClients.custom()
                .disableCookieManagement()
                .useSystemProperties()
                .setConnectionManager(connectionManager)
                .evictExpiredConnections()
                .setDefaultRequestConfig(RequestConfig.custom()
                        .setConnectTimeout(Timeout.of(
                            httpClientProperties.getConnectionTimeout(), TimeUnit.MILLISECONDS))
                        .setRedirectsEnabled(httpClientProperties.isFollowRedirects())
                        // ... other settings from httpClientProperties
                        .build());

        // Composability: apply any registered customizers
        customizerProvider.getIfAvailable(List::of).forEach(c -> c.customize(builder));

        httpClient5 = builder.build();
        return httpClient5;
    }

    @Bean
    public HttpClientBuilderCustomizer proxyCustomizer() {
        return builder -> {
            if (!properties.isProxyEnabled()) return;
            var host = properties.getProxyHost();
            if (host != null && !host.isBlank()) {
                builder.setRoutePlanner(
                    new DefaultProxyRoutePlanner(new HttpHost(host, properties.getProxyPort())));
            }
        };
    }

    @PreDestroy
    public void destroy() {
        if (httpClient5 != null) {
            httpClient5.close(CloseMode.GRACEFUL);
        }
    }

    private void configureTls(PoolingHttpClientConnectionManagerBuilder builder) {
        if (!properties.isTlsEnabled()) return;
        var sslContext = createApacheSslContext();
        var hostnameVerifier = properties.isVerifyHostname() ? null : NoopHostnameVerifier.INSTANCE;
        builder.setTlsSocketStrategy(new DefaultClientTlsStrategy(sslContext, hostnameVerifier));
    }

    // ... SSL context creation methods
}
```

Notice how we inject `FeignHttpClientProperties` to preserve all standard settings (timeouts, pool sizes) and use
`ObjectProvider<List<HttpClientBuilderCustomizer>>` to maintain composability with other customizers. Proxy
configuration is added via the customizer pattern, keeping it separate from the main builder logic, while custom
TLS is configured at the connection manager level.

#### Wiring it together

Define your Feign client with the configuration class:

```java
@FeignClient(name = "pokemon-hc5", configuration = FeignApacheHttpClient5Config.class)
public interface PokeApiClientHc5 extends PokeApiClient {
}
```

Then configure it in `application.yml`:

```yaml
spring:
  cloud:
    openfeign:
      client:
        config:
          pokemon-hc5:
            url: https://pokeapi.co
            connect-timeout: 5000
            read-timeout: 10000
            proxy:
              enabled: true
              host: localhost
              port: 8888
            tls:
              enabled: true
              trust-store: file:./certs/custom-truststore.p12
              trust-store-password: changeit
              verify-hostname: false
```

#### Other HTTP client libraries

The same customization approach applies to other HTTP client libraries. For Java HTTP/2 Client, create a
`FeignHttp2ClientConfig` class that configures proxy via `ProxySelector` and TLS via `SSLContext`—this client
benefits from native HTTP/2 multiplexing. For the default HttpURLConnection-based client, create a
`FeignDefaultClientConfig` class that uses `Client.Proxied` for proxy and a custom `SSLSocketFactory` for TLS,
though remember its limitations make it unsuitable for production. The companion repository includes working
examples for all three implementations.

### Final notes

Spring Cloud OpenFeign provides sensible defaults for most use cases, but proxy and TLS configuration
require understanding the underlying HTTP client library. There's no unified abstraction for these
concerns—and that's a deliberate design choice rather than a missing feature.

The key takeaways from this article:

- **Choose your HTTP client early**. Apache HttpClient 5 is the safe default for production. The built-in
  HttpURLConnection has limitations that will eventually cause problems.

- **Understand the child context architecture**. Per-client configuration works because each `@FeignClient`
  gets its own ApplicationContext. Beans in that context override parent beans—but only for that client.

- **Avoid the global configuration trap**. Never annotate Feign configuration classes with `@Configuration`
  or place them in component-scanned packages. This is the most common source of "why does this affect all
  my clients?" issues.

- **Preserve default behavior when customizing**. When providing your own `Client` bean, inject
  `FeignHttpClientProperties` and apply `HttpClientBuilderCustomizer` beans to maintain compatibility with
  standard configuration and other customizers.

The companion repository contains working examples for Apache HttpClient 5, Java HTTP/2 Client, and the
default HttpURLConnection-based client. Use them as starting points and adapt to your specific requirements.

[^1]: OpenFeign, "Feign makes writing java http clients easier," *GitHub Repository*,
https://github.com/OpenFeign/feign

[^2]: Spring Cloud OpenFeign, "Configuration Properties," *Spring Cloud OpenFeign Reference Documentation*,
https://docs.spring.io/spring-cloud-openfeign/reference/spring-cloud-openfeign.html

[^3]: OkHttp support remains available in OpenFeign, but `OkHttp3ClientHttpRequestFactory` was deprecated in
Spring Framework 6.1 due to OkHttp's Kotlin dependency. For new projects, Apache HttpClient 5 or the Java HTTP/2
Client are recommended alternatives.

[^4]: The default `HttpURLConnection` has a long-standing JDK bug
([JDK-8052118](https://bugs.openjdk.org/browse/JDK-8052118)) that silently discards response bodies on 401 errors
when the request includes a body. Your custom `ErrorDecoder` receives an empty response, making it impossible to
parse authentication error messages like `{"error": "invalid_credentials"}`. This bug has been open since 2014
and remains unfixed. It's often how junior developers first discover that Spring Cloud OpenFeign supports multiple
HTTP client libraries—after hours of debugging why their error handling "doesn't work," they stumble upon a
Stack Overflow answer suggesting Apache HttpClient 5, switch the dependency, and suddenly everything works.

[^5]: Apache HttpClient, "HttpClient Overview," *Apache HttpComponents Documentation*,
https://hc.apache.org/httpcomponents-client-5.4.x/

[^6]: Oracle, "Java HTTP Client," *Java Documentation*,
https://docs.oracle.com/en/java/javase/21/docs/api/java.net.http/java/net/http/HttpClient.html

[^7]: Spring Cloud Commons, "NamedContextFactory," *GitHub Source*,
https://github.com/spring-cloud/spring-cloud-commons/blob/main/spring-cloud-context/src/main/java/org/springframework/cloud/context/named/NamedContextFactory.java

[^8]: Spring Cloud OpenFeign, "HttpClient5FeignConfiguration," *GitHub Source*,
https://github.com/spring-cloud/spring-cloud-openfeign/blob/main/spring-cloud-openfeign-core/src/main/java/org/springframework/cloud/openfeign/clientconfig/HttpClient5FeignConfiguration.java



