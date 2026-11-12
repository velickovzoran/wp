package mk.ukim.finki.wp.lab.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Workshop {
    private static long counter = 1L;

    private Long id;
    private String title;
    private String category;
    private double price;
    private int capacity;
    private Instructor instructor;

    public Workshop(String title, String category, double price, int capacity, Instructor instructor) {
        this.id = counter++;
        this.title = title;
        this.category = category;
        this.price = price;
        this.capacity = capacity;
        this.instructor = instructor;
    }
}