# Product Subsystem Technical Documentation — WMS Module (Week 1)

This documentation provides an architectural blueprint of the core Product Subsystem components developed during Week 1. This module acts as the central master product catalog for the Warehouse Management System (WMS), handling unique business identifiers (SKUs) and product metadata categorization.

\---

## 1\. Subsystem Architecture \& Class Responsibilities

The subsystem is designed using a strictly decoupled, layered architecture to separate low-level database operations from client-facing API endpoints.





### A. Core Entity Model: `Product.java`

The primary persistent domain model mapped directly to our PostgreSQL database via Hibernate JPA.

* **Key Fields:** \* `id` (Long): The primary key auto-generated using database sequences (`GenerationType.IDENTITY`).

    * `sku` (String): Human-readable global business identifier.
    * `name` (String) \& `description` (String): Descriptive operational data.
    * `category` (String): Structural grouping (e.g., `ELECTRONICS`) used dynamically by the Week 2 automated routing algorithm.



### B. Data Access Layer: `ProductRepository.java`

An abstraction interface that bridges our Java application logic with the underlying database storage.

* **Responsibilities:** Extends `JpaRepository<Product, Long>` to inherit standardized database operations (Save, FindBy, Delete) without boilerplate SQL implementation.



### C. Business Service Layer: `ProductService.java`

The core business engine where foundational properties are processed before database persistence.

* **Responsibilities:**  Saves data payload to the persistent database using jpa\_repository method .save.



### D. REST Presentation Layer: `ProductController.java`

The front gate of our subsystem that maps inbound HTTP request traffic to `/api/products`.

* **Responsibilities:** Intercepts HTTP commands, binds JSON payload data structures natively into Java objects using `@RequestBody`, and handles clean REST response delivery.

\---





## 2\. API Endpoint Specification \& Payloads

To ensure absolute environment consistency across all development setups, the following endpoints are used to populate master catalog entries:



### Endpoint A: Create a New Product (Electronics Segment)



* **HTTP Method:** `POST`
* **Target URI:** `http://localhost:8081/api/products`
* **Inbound JSON Payload Structure (`@RequestBody`):**

```json
{
  "sku": "LAP-DL-XPS15",
  "name": "Dell XPS 15 Laptop",
  "description": "High-performance workstation for developers",
  "category": "ELECTRONICS"
}

