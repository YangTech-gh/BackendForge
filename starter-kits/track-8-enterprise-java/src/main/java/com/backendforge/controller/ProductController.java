package com.backendforge.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final Map<String, Product> products = new ConcurrentHashMap<>();

    @GetMapping
    public Map<String, Object> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        var all = products.values().stream().skip((long)(page-1)*limit).limit(limit).toList();
        return Map.of("data", all, "total", products.size(), "page", page);
    }

    @PostMapping
    public Product create(@RequestBody Product product) {
        product.setId(UUID.randomUUID().toString());
        products.put(product.getId(), product);
        return product;
    }

    @GetMapping("/{id}")
    public Product get(@PathVariable String id) {
        return products.getOrDefault(id, null);
    }

    public static class Product {
        private String id;
        private String name;
        private double price;
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public double getPrice() { return price; }
        public void setPrice(double price) { this.price = price; }
    }
}
