import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv


load_dotenv()


async def migrate_user_fields():
    """Migrate user fields from name/userid to full_name/user_name"""
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(os.getenv('MONGODB_URI'))
    db = client[os.getenv('MONGODB_DBNAME', 'myreadingjourney')]
    
    # Get all users
    users = await db.users.find({}).to_list(length=None)
    
    print(f"Found {len(users)} users to migrate")
    
    migrated = 0
    for user in users:
        update_fields = {}
        
        # Rename 'name' to 'full_name' if exists
        if 'name' in user and 'full_name' not in user:
            update_fields['full_name'] = user['name']
            update_fields['$unset'] = {'name': ''}
        
        # Rename 'userid' to 'user_name' if exists
        if 'userid' in user and 'user_name' not in user:
            update_fields['user_name'] = user['userid']
            if '$unset' not in update_fields:
                update_fields['$unset'] = {}
            update_fields['$unset']['userid'] = ''
        
        # Update user if needed
        if update_fields:
            unset_fields = update_fields.pop('$unset', {})
            
            operations = []
            if update_fields:
                operations.append({'$set': update_fields})
            if unset_fields:
                operations.append({'$unset': unset_fields})
            
            for operation in operations:
                await db.users.update_one(
                    {'_id': user['_id']},
                    operation
                )
            
            migrated += 1
            print(f"Migrated user: {user.get('email', 'unknown')}")
    
    print(f"\nMigration complete! Migrated {migrated} users.")
    
    # Drop old indexes
    try:
        await db.users.drop_index('userid_1')
        print("Dropped old 'userid' index")
    except Exception as e:
        print(f"Note: {e}")
    
    # Create new indexes
    await db.users.create_index('user_name', unique=True)
    print("Created new 'user_name' index")
    
    client.close()

if __name__ == '__main__':
    asyncio.run(migrate_user_fields())
