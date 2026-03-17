"""
Vercel Deployment Verification Script
Run this locally to verify everything works before deploy
"""
import json
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_handler():
    """Test the handler function locally"""
    try:
        # Import the handler
        from api.simple import handler
        
        # Test request
        test_request = {
            "method": "GET",
            "path": "/",
            "query": "",
            "body": "",
            "headers": {}
        }
        
        # Call handler
        response = handler(test_request)
        
        print("OK Handler test successful!")
        print(f"Status: {response['statusCode']}")
        print(f"Response: {json.dumps(json.loads(response['body']), indent=2)}")
        
        return True
        
    except Exception as e:
        print(f"ERROR Handler test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def verify_files():
    """Verify all required files exist"""
    required_files = [
        "api/simple.py",
        "vercel.json", 
        "requirements.txt"
    ]
    
    print("Checking required files...")
    for file in required_files:
        if os.path.exists(file):
            print(f"OK {file}")
        else:
            print(f"ERROR {file} - MISSING!")
            return False
    
    return True

def verify_vercel_config():
    """Verify vercel.json configuration"""
    try:
        with open("vercel.json", "r") as f:
            config = json.load(f)
        
        print("Checking vercel.json...")
        
        # Check required fields
        if config.get("version") != 2:
            print("ERROR Invalid version")
            return False
        
        builds = config.get("builds", [])
        if not builds:
            print("ERROR No builds found")
            return False
        
        build = builds[0]
        if build.get("src") != "api/simple.py":
            print("ERROR Invalid build src")
            return False
        
        if build.get("use") != "@vercel/python":
            print("ERROR Invalid build use")
            return False
        
        routes = config.get("routes", [])
        if not routes:
            print("ERROR No routes found")
            return False
        
        print("OK vercel.json configuration is valid")
        return True
        
    except Exception as e:
        print(f"ERROR vercel.json error: {e}")
        return False

if __name__ == "__main__":
    print("Vercel Deployment Verification")
    print("=" * 50)
    
    # Run all checks
    checks = [
        ("Files", verify_files),
        ("Vercel Config", verify_vercel_config), 
        ("Handler Function", test_handler)
    ]
    
    all_passed = True
    for name, check_func in checks:
        print(f"\n{name}:")
        if not check_func():
            all_passed = False
    
    print("\n" + "=" * 50)
    if all_passed:
        print("All checks passed! Ready for Vercel deploy!")
    else:
        print("Some checks failed. Fix issues before deploy!")
