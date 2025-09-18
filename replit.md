# Domeo No-Code Calculators (MVP)

## Overview

Domeo is a multi-page web service for door selection with commercial proposal (КП) and invoice generation capabilities. The system serves as a No-Code administrative platform that allows creating and managing product categories without code changes. The current pilot focuses on the "Doors" category with a complete workflow from catalog browsing to configuration, pricing, and order export.

The platform includes:
- Product catalog and configurator with real-time pricing
- Shopping cart with inline editing and instant recalculation
- Document generation (HTML/PDF commercial proposals and invoices)
- Factory order exports (CSV/XLSX)
- Administrative interface for price imports, media management, and category configuration
- Fixture and reference data management

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 14 with TypeScript and React 18
- **Styling**: Tailwind CSS with custom component styling
- **State Management**: React hooks with local state management
- **UI Pattern**: Three-column configurator layout with dependent dropdowns (dependsOn pattern)
- **Client-Side Logic**: Mock API layer for development with real API integration points

### Backend Architecture
- **Framework**: Next.js API Routes (App Router pattern)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based with bcrypt password hashing
- **File Handling**: Direct file uploads to public assets directory
- **Data Import**: CSV/XLSX parsing with conflict detection and resolution
- **API Design**: RESTful endpoints with OpenAPI specification

### Database Schema Design
- **Core Tables**: 
  - `doors_catalog` - Product catalog with unique composite keys
  - `doors_kits` - Hardware kit options
  - `doors_handles` - Handle options with pricing tiers
  - `users` - Authentication and role management
- **Indexing Strategy**: Unique composite index on (model, finish, color, type, width, height)
- **Data Integrity**: Safe UPSERT operations with conflict detection

### Authentication and Authorization
- **Admin Protection**: JWT middleware for `/api/admin/**` endpoints
- **Role-Based Access**: Admin, Manager, Viewer roles with different permissions
- **Security Pattern**: Bearer token authentication with automatic seeding of admin user

### Pricing Calculation Engine
- **Base Pricing**: RRC (Recommended Retail Price) from product catalog
- **Add-ons**: Hardware kits and handles with multiplier-based pricing
- **Real-time Updates**: Instant price recalculation on configuration changes
- **Formula**: `total = base + kit_add + handle_add` with proper rounding

### Import and Export System
- **Import Flow**: XLSX/CSV → mapping → validation → conflict detection → safe UPSERT
- **Conflict Resolution**: CSV reports for RRC price conflicts with canonical price selection
- **Export Templates**: Commercial proposals, invoices, and factory orders with customizable formats
- **Media Management**: Direct upload with encoded filename storage

### Development Workflow
- **Truth Sources**: Centralized documentation in root markdown files
- **API Guard**: Python script for OpenAPI specification validation
- **Smoke Testing**: Automated testing for critical endpoints and UI flows
- **CI/CD**: GitHub-based with deployment to Yandex Cloud

## External Dependencies

### Core Runtime Dependencies
- **Database**: PostgreSQL (production on Yandex Cloud, local development via Docker)
- **ORM**: Prisma Client 5.18.0 for type-safe database operations
- **Authentication**: jsonwebtoken 9.0.2 and bcryptjs 2.4.3 for JWT and password handling
- **File Processing**: xlsx 0.18.5 and csv-parse 6.1.0 for data import functionality
- **UI Components**: lucide-react 0.452.0 for icons, next-themes 0.2.1 for theme management
- **Validation**: zod 3.23.8 for runtime type validation

### Development Dependencies
- **TypeScript Stack**: TypeScript 5.5.4 with Next.js type definitions
- **CSS Processing**: Tailwind CSS 3.4.10 with PostCSS and Autoprefixer
- **Code Quality**: ESLint with Next.js configuration
- **Database Tools**: Prisma CLI for schema management and migrations

### Platform Services
- **Production Hosting**: Yandex Cloud for live deployment
- **Development Environment**: Docker Compose for local PostgreSQL instance
- **Version Control**: GitHub for code repository and CI/CD pipelines
- **Demo Environment**: Replit for staging and demonstration purposes

### API Integrations
- **1C Integration**: Planned integration for SKU and advance payment processing
- **Media Storage**: Local file system storage with public asset serving
- **Document Generation**: HTML to PDF conversion for commercial proposals and invoices

### Monitoring and Quality Assurance
- **API Validation**: Custom Python script for OpenAPI specification compliance
- **Health Checks**: Dedicated health endpoints for system monitoring
- **Smoke Testing**: Automated testing suite for critical user journeys
- **Truth Synchronization**: Automated verification of documentation consistency