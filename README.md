# restaurent-demo
```mermaid
graph TD
    subgraph "User's Device"
        U["<i class='fa fa-user'></i> User's Browser"]
    end

    subgraph "Cloud Infrastructure"
        LB["<i class='fa fa-network-wired'></i> Load Balancer /<br>API Gateway"]
        
        subgraph "Web Server / Frontend"
            FE["<i class='fa fa-window-maximize'></i> Web App <br>(React/Vue/Angular)"]
        end

        subgraph "Backend Services (Private Network)"
            API["<i class='fa fa-server'></i> API Server <br>(Handles Logic)"]
            DB[("<i class='fa fa-database'></i> Database <br>(Stores Data)")]
        end
    end

    subgraph "External Services"
        PG["<i class='fa fa-credit-card'></i> Payment Gateway API<br>(Stripe, PayPal, etc.)"]
    end

    %% --- Connections ---
    U -- HTTPS Request --> LB
    LB --> FE
    LB -- /api/* --> API
    
    FE -- Loads in Browser --> U
    
    API -- Reads/Writes Data --> DB
    API -- Secure API Call --> PG

    %% --- Styling for Dark Mode ---
    style U fill:#1e40af,stroke:#60a5fa
    style FE fill:#047857,stroke:#34d399
    style API fill:#7c2d12,stroke:#fb923c
    style DB fill:#86198f,stroke:#e879f9
    style PG fill:#374151,stroke:#9ca3af
    style LB fill:#5b21b6,stroke:#a78bfa
    
