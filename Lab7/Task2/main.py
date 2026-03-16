from models import Car, ElectricBike

def main():
    # Init
    my_sedan = Car("Tesla", "Model 3", 2023, 4)
    my_moto = ElectricBike("Zero", "SR/S", 2024, 150)

    # Objects in a list
    garage = [my_sedan, my_moto]

    print("--- Vehicle Inventory Report ---")
    
    for vehicle in garage:
        # 1. Demonstrate __str__ method
        print(f"Vehicle: {vehicle}")
        
        # 2. Call methods from the Base Class
        print(f"Action: {vehicle.start_engine()}")
        
        # 3. Demonstrate POLYMORPHISM 
        # (Same method name, different behavior based on class)
        print(f"Fuel System: {vehicle.fuel_info()}")
        
        # 4. Demonstrate Unique Child Methods
        if isinstance(vehicle, Car):
            print(f"Feature: {vehicle.open_sunroof()}")
        elif isinstance(vehicle, ElectricBike):
            print(f"Feature: {vehicle.check_charge()}")
            
        print("-" * 35)

if __name__ == "__main__":
    main()