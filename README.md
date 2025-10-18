# restaurent-demo
sequenceDiagram
    actor User
    participant WebApp as "Frontend App"
    participant APIServer as "Backend API (Node/Python)"
    participant Database as "Database (SQL/NoSQL)"
    participant PaymentGateway as "External Payment Gateway"

    Title: <span style="font-size: 24px; font-weight: bold;">Website Backend Operations Flow</span>

    box "User Interaction" rgb(220, 255, 220)
        User->>WebApp: Browse food items
        note over User,WebApp: User explores the menu for selection.
        WebApp->>APIServer: Request Menu (GET /api/menu)
        APIServer->>Database: Query: SELECT * FROM food_items
        Database-->>APIServer: Return: Food Item List
        APIServer-->>WebApp: Send: Menu Data
        WebApp-->>User: Display: Menu UI
    end

    box "Shopping Cart Management" rgb(255, 255, 220)
        User->>WebApp: Add item to cart (Item A, Qty 2)
        WebApp->>APIServer: Add to Cart (POST /api/cart/add)
        APIServer->>Database: Update/Insert: user_cart (item_id, quantity, user_id)
        Database-->>APIServer: Confirmation: Cart Updated
        APIServer-->>WebApp: Response: Cart Status
        WebApp-->>User: Show: Updated Cart View
    end

    box "Coupon & Discount Processing" rgb(255, 230, 200)
        User->>WebApp: Enter Coupon Code (e.g., SAVE10)
        WebApp->>APIServer: Validate Coupon (POST /api/coupon/validate)
        APIServer->>Database: Query: SELECT discount FROM coupons WHERE code='SAVE10' AND is_active=TRUE
        alt Coupon is Valid
            Database-->>APIServer: Return: Discount Amount
            APIServer-->>WebApp: Response: { valid: true, discount: 10% }
            WebApp-->>User: Display: Discount Applied, New Total
        else Coupon Invalid/Expired
            Database-->>APIServer: Return: No Coupon Found
            APIServer-->>WebApp: Response: { valid: false, message: "Invalid Coupon" }
            WebApp-->>User: Show: Error Message
        end
    end

    box "Order Creation & Payment Initiation" rgb(220, 230, 255)
        User->>WebApp: Proceed to Checkout
        WebApp->>APIServer: Create Order (POST /api/orders/create, cart_id)
        APIServer->>Database: Insert: INTO orders (user_id, total_amount, status='pending')
        Database-->>APIServer: Return: order_id
        APIServer->>PaymentGateway: Initiate: Payment Session (order_id, amount)
        PaymentGateway-->>APIServer: Return: Payment URL / Session ID
        APIServer-->>WebApp: Redirect: to Payment Gateway
        WebApp-->>User: Redirect: to Secure Payment Page
    end

    box "Payment Processing & Confirmation" rgb(230, 255, 230)
        User->>PaymentGateway: Enter Payment Details & Confirm
        note over User,PaymentGateway: Secure processing by Payment Gateway.
        PaymentGateway-->>User: Display: Payment Result
        PaymentGateway->>APIServer: Webhook: Payment Status (order_id, status='success/failed')
        APIServer->>Database: Update: orders SET status='paid' WHERE order_id=?
        Database-->>APIServer: Confirmation: Order Status Updated
        APIServer-->>WebApp: Notify: Order Paid (via WebSockets/Polling)
        WebApp-->>User: Show: Order Confirmation Screen
        note right of User: User receives order confirmation and details.
    end
