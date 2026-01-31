import os
from models import Filament, Print

def init_database():
    print("Initializing database...")
    
    # Create tables
    Filament.create_table()
    Print.create_table()
    
    # Add example filaments if none exist
    filaments = Filament.get_all()
    if not filaments:
        print("Adding example filaments...")
        Filament.create("PLA Schwarz", 20.00)
        Filament.create("PLA Weiss", 20.00)
        Filament.create("PETG Transparent", 25.00)
        Filament.create("ABS Rot", 22.00)
        Filament.create("TPU Flexibel", 35.00)
        print("Example filaments added!")
    
    print("Database initialized successfully!")

if __name__ == "__main__":
    init_database()