# java style B)
class Vehicle:
    # Base Class, vehicle
    def __init__(self, brand, model, year):
        self.brand = brand
        self.model = model
        self.year = year
        self.is_running = False

    def start_engine(self):
        self.is_running = True
        return f"The {self.brand}'s engine is now roaring!"

    def stop_engine(self):
        self.is_running = False
        return f"The {self.brand}'s engine has stopped."

    def fuel_info(self):
        # Method to be overridden
        return "Unknown fuel source."

    def __str__(self):
        return f"{self.year} {self.brand} {self.model}"


class Car(Vehicle):
    # Child Class: Inherits from Vehicle
    def __init__(self, brand, model, year, num_doors):
        # Call the parent constructor
        super().__init__(brand, model, year)
        self.num_doors = num_doors

    def open_sunroof(self):
        return f"Opening the sunroof of the {self.model}..."

    def fuel_info(self):
        # Overriding the parent method
        return "This car runs on Gasoline."


class ElectricBike(Vehicle):
    # Child Class: Inherits from Vehicle
    def __init__(self, brand, model, year, battery_range):
        super().__init__(brand, model, year)
        self.battery_range = battery_range

    def check_charge(self):
        return f"Battery status: High. Range: {self.battery_range} miles."

    def fuel_info(self):
        # Overriding the parent method
        return "This bike runs on Electricity (Zero Emissions)."