import uvicorn

if __name__ == "__main__":
    # Seed the database with initial data
    print("Seeding database...")
    from seed_data import seed_database
    seed_database()
    

    # Start the server
    print("Starting server...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
