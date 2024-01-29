import tkinter as tk
import csv

def read_csv(file_path):
    x_values = []
    y_values = []
    categories = []

    with open(file_path, 'r') as file:
        reader = csv.reader(file)
        for row in reader:
            x_values.append(float(row[0]))
            y_values.append(float(row[1]))
            categories.append(row[2])

    return x_values, y_values, categories