package com.sharehub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

@SpringBootApplication
public class ShareHubApiApplication {

    public static void main(String[] args) {
        initDatabase();
        SpringApplication.run(ShareHubApiApplication.class, args);
    }

    private static void initDatabase() {
        String baseUrl = "jdbc:mysql://localhost:3306?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Shanghai&useUnicode=true&characterEncoding=UTF-8";
        String user = "root";
        String password = "qwer";

        try (Connection conn = DriverManager.getConnection(baseUrl, user, password);
             Statement stmt = conn.createStatement()) {
            stmt.executeUpdate("CREATE DATABASE IF NOT EXISTS sharehub DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            System.out.println("Database 'sharehub' is ready (utf8mb4).");
        } catch (Exception e) {
            System.err.println("Warning: Database init error: " + e.getMessage());
        }
    }
}