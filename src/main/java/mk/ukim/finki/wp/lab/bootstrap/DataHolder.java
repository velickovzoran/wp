package mk.ukim.finki.wp.lab.bootstrap;

import jakarta.annotation.PostConstruct;
import mk.ukim.finki.wp.lab.model.Instructor;
import mk.ukim.finki.wp.lab.model.Registration;
import mk.ukim.finki.wp.lab.model.Workshop;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DataHolder {
    public static List<Workshop> workshops = null;
    public static List<Registration> registrations = null;
    public static List<Instructor> instructors = null;

    @PostConstruct
    public void init() {
        instructors = new ArrayList<>();
        Instructor i1 = new Instructor(1L, "Ana", "Petrovska", "ana@finki.mk", "Programming");
        Instructor i2 = new Instructor(2L, "Marko", "Stojanov", "marko@finki.mk", "DevOps");
        Instructor i3 = new Instructor(3L, "Elena", "Ristova", "elena@finki.mk", "Design");
        instructors.add(i1);
        instructors.add(i2);
        instructors.add(i3);

        workshops = new ArrayList<>();
        workshops.add(new Workshop("Spring Boot Basics", "Programming", 1500, 20, i1));
        workshops.add(new Workshop("Intro to Docker", "DevOps", 1200, 15, i2));
        workshops.add(new Workshop("UI/UX Fundamentals", "Design", 1000, 10, i3));
        workshops.add(new Workshop("Machine Learning 101", "AI", 2500, 0, i1));
        workshops.add(new Workshop("Git & GitHub", "Programming", 500, 30, i2));
        workshops.add(new Workshop("Photography for Beginners", "Media", 800, 12, i3));
        workshops.add(new Workshop("Video Editing", "Media", 1300, 8, i3));
        workshops.add(new Workshop("Public Speaking", "Soft Skills", 600, 25, i1));
        workshops.add(new Workshop("SQL for Everyone", "Databases", 900, 18, i2));
        workshops.add(new Workshop("Cybersecurity Essentials", "Security", 2000, 5, i2));

        registrations = new ArrayList<>();
    }
}