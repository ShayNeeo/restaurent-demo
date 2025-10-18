# restaurent-demo
graph TD
    subgraph "User's Device"
        U[<i class='fa fa-user'></i> User's Browser]
    end

    subgraph "Cloud Infrastructure"
        LB[<i class='fa fa-network-wired'></i> Load Balancer /<br>API Gateway]
        
        subgraph "Web Server / Frontend"
            FE[<i class='fa fa-window-maximize'></i> Web App <br>(React/Vue/Angular)]
        end

        subgraph "Backend Services (Private Network)"
            API[<i class='fa fa-server'></i> API Server <br>(Handles Logic)]
            DB[(<i class='fa fa-database'></i> Database <br>(Stores Data))]
        end
    end

    subgraph "External Services"
        PG[<i class='fa fa-credit-card'></i> Payment Gateway API<br>(Stripe, PayPal, etc.)]
    end

    %% --- Connections ---
    U -- HTTPS Request --> LB
    LB --> FE
    LB -- /api/* --> API
    
    FE -- Loads in Browser --> U
    
    API -- Reads/Writes Data --> DB
    API -- Secure API Call --> PG

    %% --- Styling ---
    style U fill:#d1e7dd,stroke:#198754
    style FE fill:#cff4fc,stroke:#0dcaf0
    style API fill:#fff3cd,stroke:#ffc107
    style DB fill:#f8d7da,stroke:#dc3545
    style PG fill:#e2e3e5,stroke:#6c757d
    style LB fill:#cfe2ff,stroke:#0d6efd
