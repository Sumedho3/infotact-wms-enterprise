package com.infotact.inventory.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.infotact.inventory.constants.OrderStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "orders")
@Data
public class Order {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private OrderStatus status; // PENDING, PACKED, FAILED

    private LocalDateTime createdAt;

    // 🎯 THE LINK: cascade ensures when you save an Order, it automatically saves all child items.
    // orphanRemoval ensures if you delete an item from the list, it's deleted from the DB.
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrderItem> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Helper method to synchronize bidirectional entity graph links safely
    public void addRequiredItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }
}
