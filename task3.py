import tkinter as tk
import csv

file_path = "data1.csv"


def read_csv(file_path):
    x_values = []
    y_values = []
    categories = []

    with open(file_path, "r") as file:
        reader = csv.reader(file)
        for row in reader:
            x_values.append(float(row[0]))
            y_values.append(float(row[1]))
            categories.append(row[2])

    return x_values, y_values, categories


x_values, y_values, categories = read_csv(file_path)

# Find the minimum and maximum values
xmin = min(x_values)
xmax = max(x_values)

ymin = min(y_values)
ymax = max(y_values)

print(f"Minimum value of x_values: ", xmin)
print(f"Maximum value of x_values: ", xmax)
print(f"Minimum value of y_values: ", ymin)
print(f"Maximum value of y_values: ", ymax)
