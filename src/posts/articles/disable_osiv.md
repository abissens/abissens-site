---
title: "Disable Open Session In View"
date: "2025-12-14"
tags: [ "java", "spring", "jpa", "Hibernate", "preview" ]
author: 'Abissens'
git: https://github.com/elethought-courses/osiv-course.git
---

Open Session In View is a blind spot for most Spring developers—not because it's obscure, but because it works
silently until it doesn't. This article explains what OSIV does, why it's problematic, and what breaks when
you disable it.
---

Having asked about Open Session In View in many interviews, I've noticed it's a blind spot for most developers.
Not because it's obscure—every Spring Boot startup displays a warning about it—but because it works silently
in the background until it doesn't.

Every Spring Boot application with JPA displays this warning at startup:

```shell
WARN 7140 --- [main] JpaBaseConfiguration$JpaWebConfiguration :
spring.jpa.open-in-view is enabled by default.
Therefore, database queries may be performed during view rendering.
Explicitly configure spring.jpa.open-in-view to disable this warning
```

Spring Boot enables OSIV by default primarily for developer convenience: 
it prevents `LazyInitializationException` errors that would otherwise surface when accessing 
unloaded entity associations in views or controllers. 
For newcomers to JPA, these exceptions can be confusing and frustrating. 
OSIV makes things "just work"—at a cost that only becomes apparent later.

However, the Spring team recognized that this convenience comes with trade-offs. 
Rather than changing the default and breaking existing applications, 
they opted to display this warning—encouraging developers to make an explicit, informed choice. 
The message is clear: understand what OSIV does, then decide whether to keep it enabled or disable it for your use case.

### What is Open Session In View ?

Like its name suggests, Open Session In View binds the database session lifecycle to the view layer requests;
Session (a.k.a. `Hibernate Session`, `Entity Manager`, `Persistence context`, `Unit of Work`, etc.) opens when the request starts and closes
when it finishes.

Spring Boot names this pattern `Open EntityManager in View`

> If you are running a web application, Spring Boot by default registers OpenEntityManagerInViewInterceptor to apply
> the "Open EntityManager in View" pattern, to allow for lazy loading in web views.
> If you do not want this behavior, you should set spring.jpa.open-in-view to false in your application.properties.[^1]

This is an antipattern. On one hand, it violates many of the SOLID principles; on the other, it introduces
new structural and performance issues. The OSIV pattern violates the Single Responsibility Principle by making the
view layer handle data access concerns.

Then in a broad sense, it violates the Liskov Substitution Principle since the behavior of
the persistence context becomes an implicit part of the contract of your service layer.
Under OSIV, a service method that appears to return a fully usable domain object may in fact rely
on the continued presence of an open EntityManager during view rendering. If the same service is later reused in a
different context
(batch processing, async execution, messaging, tests, or even another web stack) where OSIV is disabled,
the exact same call can suddenly fail with LazyInitializationException.
In other words, the service can no longer be safely substituted in all contexts that expect the same abstraction,
because its correctness depends on hidden infrastructure behavior rather than on its declared API.

Furthermore, OSIV blurs the boundary between layers by allowing lazy-loading to occur during view rendering, which
implicitly couples the presentation layer to JPA semantics. This tight coupling makes the system harder to reason about,
harder to test, and more fragile to refactoring. From a performance standpoint, it often leads to the notorious N+1
query problem[^3], as entity graphs are incrementally fetched while iterating in the view layer, far away from where queries
can be controlled, optimized, or even noticed.

Finally, keeping the persistence context open for the entire request lifecycle increases memory usage and database
connection pressure, especially under high concurrency. What initially appears as a convenience feature ultimately
trades short-term simplicity for long-term architectural erosion, encouraging an anemic service layer and pushing
critical data-access decisions into the least appropriate place: the view.

More details about these issues can be read in Vlad Mihalcea's blog post[^2].

### What does it take to disable OSIV ?

Even a well-architected application with Domain/Persistence separation can suffer from OSIV issues. I have known far too many teams
surprised by the number of issues revealed after disabling it late in the project. This section tries to demonstrate these possible issues and
how to handle them. 

For this purpose, I created two identical applications available in [this repository](https://github.com/elethought-courses/osiv-course.git).
`osiv-enabled-by-default` does not disable the default OSIV behaviour while `osiv-disabled` does disable it.

The following diagram shows how an `Order` domain is mapped and separated from persistence entities.
It highlights actual and hidden issues when OSIV is not disabled.

<Diagram name="osiv/osiv-course-model" alt="Order domain mapping with OSIV issues highlighted" />

The first thing to notice here is that even though the application architecture seems not to share persistence objects with
service and API layers and that the service layer does not directly manipulate JPA entities, OSIV is still silently
introducing coupling and issues. 

During the mapping from JPA entities to domain objects, lazy associations may be accessed. 
Because the session is always open, these queries succeed silently rather than failing with a `LazyInitializationException`.

As a result, N+1 issues silently accumulate and proliferate throughout the codebase.

As explained below, trying to disable OSIV and defining transaction boundaries at the service layer will address lazy initialization
issues but still hide N+1 ones, and introducing more fixes can reveal previously hidden MultiBag errors. 

The application appears well-structured, yet it secretly depends on the persistence context remaining open throughout
the entire request lifecycle - masking what would otherwise be obvious architectural violations.

Let's try to disable OSIV and see what breaks. In `application.properties`, we simply add:

```properties
spring.jpa.open-in-view=false
```

Running the application and calling the Order API endpoint immediately reveals the first issue: 

```shell
curl --location 'http://localhost:8080/orders/1'

org.hibernate.LazyInitializationException: Cannot lazily initialize collection of role 'tech.elethoughts.courses.persistence.infrastructure.entities.OrderJpaEntity.orderLines' (no session)
	at org.hibernate.collection.spi.AbstractPersistentCollection.throwLazyInitializationException(AbstractPersistentCollection.java:658) ~[hibernate-core-7.1.8.Final.jar:7.1.8.Final]
	at org.hibernate.collection.spi.AbstractPersistentCollection.throwLazyInitializationException(AbstractPersistentCollection.java:653) ~[hibernate-core-7.1.8.Final.jar:7.1.8.Final]
	at org.hibernate.collection.spi.AbstractPersistentCollection.withTemporarySessionIfNeeded(AbstractPersistentCollection.java:237) ~[hibernate-core-7.1.8.Final.jar:7.1.8.Final]
	at org.hibernate.collection.spi.AbstractPersistentCollection.readSize(AbstractPersistentCollection.java:160) ~[hibernate-core-7.1.8.Final.jar:7.1.8.Final]
	at org.hibernate.collection.spi.PersistentBag.size(PersistentBag.java:402) ~[hibernate-core-7.1.8.Final.jar:7.1.8.Final]
	at tech.elethoughts.courses.persistence.infrastructure.repositories.OrderMapperImpl.orderLineJpaEntityListToOrderLineList(OrderMapperImpl.java:60) ~[classes/:na]
	at tech.elethoughts.courses.persistence.infrastructure.repositories.OrderMapperImpl.toDomain(OrderMapperImpl.java:43) ~[classes/:na]
	at java.base/java.util.Optional.map(Optional.java:260) ~[na:na]
```

At this point, one might be tempted to add the `@Transactional` annotation to all high-level application service methods. This will bind the persistence session
to the transaction boundaries. On fetch-only services, the `readOnly` attribute should be set[^4][^5].

The service works again. But all we did is narrow the persistence session lifecycle from the request context
to the transactional service. We certainly slightly enhanced database connection pool performance, but we didn't fix the previously announced
hidden issues. 

First, it feels odd to add a transactional boundary not to actually perform a transaction but to keep the persistence
session alive for lazy loading. We are essentially abusing `@Transactional` as a session management tool rather than
for its intended purpose of ensuring atomicity and consistency. Keep in mind that in Spring Data, all JPA repositories are
transactional by default[^4] (even fetch methods). Transactional services are meant to coordinate multiple repository
calls into a single unit of work, not to artificially extend the persistence context for lazy loading convenience. 

Also, this approach leads to similar congestion issues as with OSIV enabled: the database connection is held for the
entire duration of the service method execution, including any slow operations like external API calls or complex
computations that don't actually need the connection. 

Second, let's analyse Hibernate logs. Here we have:

```sql
-- 1. Fetch order
select ... from orders where id=?
-- 2. Fetch order lines for this order
select ... from order_lines where order_id=?
-- 3. Fetch product for order line 1
select ... from products where id=?
-- 4. Fetch tags for product 1
select ... from product_tags join tags where product_id=?
-- 5. Fetch product for order line 2
select ... from products where id=?
-- 6. Fetch tags for product 2
select ... from product_tags join tags where product_id=?
-- 7. Fetch order notes
select ... from order_notes where order_id=?
```

This is a textbook N+1 problem. For a single order with 2 order lines, we execute 7 queries. The pattern is clear:
one query for the order, one for order lines, then for each order line we fetch the product and its tags separately.
With 10 order lines, we would have 1 + 1 + (10 × 2) + 1 = 23 queries. With 100 order lines, 203 queries.
This multiplies further if we list multiple orders.

To fix it, we will need to fetch all the required data as efficiently as possible with the fewest possible
database queries. Let's try joins: 

```java
public interface OrderJpaRepository extends JpaRepository<OrderJpaEntity, Long> {
    @Query("""
            SELECT o FROM OrderJpaEntity o
            LEFT JOIN FETCH o.orderLines ol
            LEFT JOIN FETCH ol.product p
            LEFT JOIN FETCH p.tags
            LEFT JOIN FETCH o.notes
            WHERE o.id = :id
            """)
    Optional<OrderJpaEntity> findByIdWithDetails(@Param("id") Long id);
}
```

This leads to a "hidden" MultiBag issue we were not aware of with OSIV activated: 

```shell
org.hibernate.loader.MultipleBagFetchException: cannot simultaneously fetch multiple bags: [tech.elethoughts.courses.persistence.infrastructure.entities.OrderJpaEntity.notes, tech.elethoughts.courses.persistence.infrastructure.entities.OrderJpaEntity.orderLines]
	at org.hibernate.query.sqm.sql.BaseSqmToSqlAstConverter.createFetch(BaseSqmToSqlAstConverter.java:8560) ~[hibernate-core-7.1.8.Final.jar:7.1.8.Final]
	at org.hibernate.query.sqm.sql.BaseSqmToSqlAstConverter.visitFetches(BaseSqmToSqlAstConverter.java:8605) ~[hibernate-core-7.1.8.Final.jar:7.1.8.Final]
	at org.hibernate.sql.results.graph.AbstractFetchParent.afterInitialize(AbstractFetchParent.java:40) ~[hibernate-core-7.1.8.Final.jar:7.1.8.Final]
	at org.hibernate.sql.results.graph.entity.AbstractEntityResultGraphNode.afterInitialize(AbstractEntityResultGraphNode.java:72) ~[hibernate-core-7.1.8.Final.jar:7.1.8.Final]
	at org.hibernate.persister.entity.AbstractEntityPersister.createDomainResult(AbstractEntityPersister.java:1298) ~[hibernate-core-7.1.8.Final.jar:7.1.8.Final]
	at org.hibernate.query.sqm.sql.internal.AbstractSqmPathInterpretation.createDomainResult(AbstractSqmPathInterpretation.java:53) ~[hibernate-core-7.1.8.Final.jar:7.1.8.Final]
	at org.hibernate.query.sqm.sql.BaseSqmToSqlAstConverter.lambda$callResultProducers$19(BaseSqmToSqlAstConverter.java:2286) ~[hibernate-core-7.1.8.Final.jar:7.1.8.Final]
	at java.base/java.util.Collections$SingletonList.forEach(Collections.java:5297) ~[na:na]
```

The `MultipleBagFetchException`[^6] occurs because Hibernate cannot fetch multiple `List` (bag) collections in a single query.
Doing so would produce a Cartesian product, resulting in duplicate rows and incorrect data. This issue was always present
in our entity model, but OSIV masked it by lazily loading each collection separately. Now that we're trying to optimize
with eager fetching, the problem surfaces.

When facing this error, a quick search leads to countless Stack Overflow answers and blog posts suggesting to simply
change `List` to `Set` in entity mappings. Unless we land on Vlad Mihalcea's[^6] article or are already aware of database
performance implications, we will likely apply this fix. The code compiles, the exception disappears, and the feature
seems to work. Logs show only one SQL join-based query:

```shell
select
    ...
from
    orders oje1_0 
left join
    order_lines ol1_0 
        on oje1_0.id=ol1_0.order_id 
left join
    products p1_0 
        on p1_0.id=ol1_0.product_id 
left join
    product_tags t1_0 
        on p1_0.id=t1_0.product_id 
left join
    tags t1_1 
        on t1_1.id=t1_0.tag_id 
left join
    order_notes n1_0 
        on oje1_0.id=n1_0.order_id 
where
    oje1_0.id=?
```

But we've just traded one hidden problem for another: the Cartesian product is still there, silently
multiplying rows in the result set. The `Set` merely deduplicates in memory, masking the fact that we're fetching far
more data than necessary from the database.

**This `List` to `Set` change is a particularly dangerous fix** because it appears to work perfectly in development
with small datasets. The real cost becomes visible only in production: if an order has 5 lines and 3 notes,
the database returns 15 rows instead of 5 + 3. With 50 lines and 20 notes, you get 1000 rows instead of 70.
The network overhead and memory consumption grow quadratically while your application happily deduplicates
the bloated result set.

Additionally, changing from `List` to `Set` alters collection semantics. Lists preserve insertion order and allow
duplicates; Sets do not. If your domain logic relies on ordering (e.g., order lines sorted by line number) or
allows duplicate entries, this "fix" silently breaks business rules.

The proper solution is to split the fetch into multiple queries, each fetching one collection at a time. 

For purists who don't want to tamper with transactions to leverage persistence session capabilities, this can be done "manually":

```java
public interface OrderJpaRepository extends JpaRepository<OrderJpaEntity, Long> {
    @Query("""
            SELECT o FROM OrderJpaEntity o
            LEFT JOIN FETCH o.orderLines ol
            LEFT JOIN FETCH ol.product p
            WHERE o.id = :id
            """)
    Optional<OrderJpaEntity> findByIdWithOrderLines(@Param("id") Long id);

    @Query("""
            SELECT n FROM OrderNoteJpaEntity n
            WHERE n.order.id = :orderId
            """)
    List<OrderNoteJpaEntity> findNotesByOrderId(@Param("orderId") Long orderId);
}
// ...
@Override
public Optional<Order> findById(Long id) {
    // Query 1: fetch order with orderLines, product, tags
    var orderOpt = jpaRepository.findByIdWithOrderLines(id);
    if (orderOpt.isEmpty()) {
        return Optional.empty();
    }
    // Query 2: fetch notes separately (not through lazy proxy)
    var notes = jpaRepository.findNotesByOrderId(id);

    return Optional.of(mapper.toDomain(orderOpt.get(), notes));
}
//...
@Mapper(componentModel = "spring", uses = {OrderLineMapper.class, OrderNoteMapper.class})
public abstract class OrderMapper {
    // ...
    public Order toDomain(OrderJpaEntity entity, List<OrderNoteJpaEntity> notes) {
        return new Order(
                entity.getId(),
                entity.getCustomerId(),
                entity.getCreatedAt(),
                entity.getStatus(),
                entity.getOrderLines().stream()
                        .map(orderLineMapper::toDomain)
                        .toList(),
                notes.stream()
                        .map(orderNoteMapper::toDomain)
                        .toList()
        );
    }
}
```

Alternatively, we can leverage Hibernate's persistence context by executing multiple queries within the same transaction. 
Hibernate's first-level cache will automatically merge the results: when the same entity is fetched
in subsequent queries, its collections get populated without duplication. 
This requires a transactional boundary, but it's acceptable as long as the transaction only contains database operations
and no application logic, external API calls, or slow computations that would unnecessarily hold the connection open: 

```java
@Transactional(readOnly = true)
public Optional<Order> findById(Long id) {
    // Two queries in same session - Hibernate merges results in persistence context
    // Query 1: fetch orderLines with product and tags
    var order = jpaRepository.findByIdWithOrderLines(id);
    // Query 2: fetch notes (same entity, Hibernate merges the notes collection)
    jpaRepository.findByIdWithNotes(id);

    return order.map(mapper::toDomain);
}
```

Both approaches result in exactly 2 queries instead of N+1, with no Cartesian product overhead.

Disabling OSIV is not just about flipping a configuration switch. It forces us to confront architectural decisions that
were silently deferred: where transaction boundaries belong, how data should be fetched, and which layer is responsible
for what. The effort required depends on how deeply OSIV has embedded itself into the application's assumptions. But the
result is a cleaner, more predictable, and more performant architecture.

### Can unit tests reveal persistence session lifecycle related issues ?

One might wonder: shouldn't our tests have caught these issues earlier? The answer is nuanced.

`@DataJpaTest` tests are transactional by default, meaning the persistence context remains open for the entire test
method. This mimics OSIV behaviour: lazy associations can be accessed without throwing `LazyInitializationException`,
and the test passes even though the same code would fail in production with OSIV disabled. The test environment
inadvertently hides the very issues we're trying to catch.

To make tests behave like production with OSIV disabled, we need to disable the default transactional behaviour.
The demo project uses a custom annotation for this purpose:

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@ComponentScan(basePackages = "tech.elethoughts.courses.persistence.infrastructure.repositories")
@Transactional(propagation = Propagation.NOT_SUPPORTED)
@TestExecutionListeners(listeners = DatabaseCleanupListener.class, mergeMode = MERGE_WITH_DEFAULTS)
@Execution(ExecutionMode.SAME_THREAD)
@ResourceLock("database")
public @interface NonTransactionalDataJpaTest {
}
```

Let's break down each annotation:

- **`@AutoConfigureTestDatabase(replace = Replace.ANY)`**: Replaces any configured datasource with an embedded database
  (H2 in our case). This ensures tests run against a fresh, isolated database regardless of application configuration.

- **`@Transactional(propagation = Propagation.NOT_SUPPORTED)`**: The key element. Disables the default transactional
  wrapper that `@DataJpaTest` applies. Each repository call now runs in its own transaction, just like in production
  with OSIV disabled.

- **`@TestExecutionListeners(..., mergeMode = MERGE_WITH_DEFAULTS)`**: Registers our `DatabaseCleanupListener` while
  keeping Spring's default listeners (dependency injection, dirty context handling, etc.). Without `MERGE_WITH_DEFAULTS`,
  we would lose essential Spring Test functionality.

- **`@Execution(ExecutionMode.SAME_THREAD)`** and **`@ResourceLock("database")`**: JUnit 5 parallel execution controls.
  Since we truncate tables before each test, parallel execution would cause race conditions. These annotations ensure
  database tests run sequentially, even when parallel execution is enabled globally.

The project enables parallel test execution in `junit-platform.properties`:

```properties
junit.jupiter.execution.parallel.enabled=true
junit.jupiter.execution.parallel.mode.default=concurrent
junit.jupiter.execution.parallel.mode.classes.default=concurrent
junit.jupiter.execution.parallel.config.strategy=fixed
junit.jupiter.execution.parallel.config.fixed.parallelism=4
```

This configuration runs tests concurrently by default with 4 parallel threads. However, `@Execution(ExecutionMode.SAME_THREAD)`
and `@ResourceLock("database")` override this for our repository tests, ensuring they don't interfere with each other
while still allowing other non-database tests to run in parallel.

Without transaction rollback to clean up after each test, we need a `DatabaseCleanupListener` that truncates
tables before each test method:

```java
public class DatabaseCleanupListener extends AbstractTestExecutionListener {

    private static final String[] TABLES_TO_TRUNCATE = {
            "order_notes", "order_lines", "orders",
            "customer_phone_numbers", "customer_profiles", "customers",
            "product_tags", "products", "categories", "tags"
    };

    @Override
    public void beforeTestMethod(TestContext testContext) {
        var jdbcTemplate = testContext.getApplicationContext().getBean(JdbcTemplate.class);
        jdbcTemplate.execute("SET REFERENTIAL_INTEGRITY FALSE");
        for (String table : TABLES_TO_TRUNCATE) {
            jdbcTemplate.execute("TRUNCATE TABLE " + table);
        }
        jdbcTemplate.execute("SET REFERENTIAL_INTEGRITY TRUE");
    }
}
```

With this setup, tests now behave like production: if the repository doesn't properly fetch all required data,
the test fails with `LazyInitializationException`. This catches issues early, before they reach production.

Should we apply this pattern to all our database repository tests? It depends. Non-transactional tests are slower
(no rollback means actual cleanup) and require more infrastructure code. For projects where OSIV is already disabled
and repositories are well-designed with explicit fetch strategies, standard `@DataJpaTest` may suffice. But for legacy
codebases migrating away from OSIV, or for teams wanting to enforce proper data fetching from day one, this pattern
provides a valuable safety net. The extra setup cost pays off by catching persistence issues in the test suite rather
than in production.

### Final notes

Disabling OSIV is not merely a configuration change — it's a commitment to explicit, intentional data access. The journey
reveals issues that were always present but conveniently hidden: lazy initialization exceptions, N+1 queries, MultiBag
fetch problems, and implicit coupling between layers.

The key takeaways:

- **Disable OSIV from day one** on new projects. Add `spring.jpa.open-in-view=false` to your `application.properties`
  before writing your first entity.

- **Use explicit fetch strategies**. Design your repositories to fetch exactly what each use case needs, using JOIN FETCH
  queries or multiple queries that leverage Hibernate's persistence context.

- **Keep transactions focused**. Use `@Transactional` for coordinating multiple operations, not for keeping the session
  alive. Ensure transactions contain only database operations, not slow external calls.

- **Test realistically**. Consider non-transactional tests to catch persistence issues before they reach production.

The warning Spring Boot displays at every startup is not just noise — it's a reminder that convenience often comes at
the cost of clarity, performance, and maintainability. Disabling OSIV forces us to be explicit about our data access
patterns, and that explicitness pays dividends in the long run.

[^1]: Spring Framework, "JPA and Spring Data," *Spring Boot Reference
Documentation*, https://docs.spring.io/spring-boot/reference/data/sql.html#data.sql.jpa-and-spring-data.open-entity-manager-in-view

[^2]: Vlad Mihalcea, "The Open Session In View Anti-Pattern," https://vladmihalcea.com/the-open-session-in-view-anti-pattern/

[^3]: Baeldung, "The N+1 Problem in Hibernate and Spring Data JPA," https://www.baeldung.com/spring-hibernate-n1-problem

[^4]: Spring Data JPA, "Transactional Queries," *Spring Data JPA Reference Documentation*, https://docs.spring.io/spring-data/jpa/reference/jpa/transactions.html

[^5]: Vlad Mihalcea, "Spring Read-Only Transaction Hibernate Optimization," https://vladmihalcea.com/spring-read-only-transaction-hibernate-optimization/

[^6]: Vlad Mihalcea, "The Best Way to Fix the Hibernate MultipleBagFetchException," https://vladmihalcea.com/hibernate-multiplebagfetchexception/
