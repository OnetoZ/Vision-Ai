from auth import hash_password, create_access_token
print(hash_password("password123"))
print(create_access_token("123", "test@test.com"))
