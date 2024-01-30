import tkinter as tk
import csv

# Constants for canvas size and margins
WIDTH, HEIGHT = 600, 400
MARGIN = 50

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


# Determine the scale based on data range
min_x, max_x = min(x_values), max(x_values)
min_y, max_y = min(y_values), max(y_values)
x_scale = (WIDTH - 2 * MARGIN) / (max_x - min_x)
y_scale = (HEIGHT - 2 * MARGIN) / (max_y - min_y)


# Function to convert data point to canvas coordinates
def to_canvas_coordinates(x, y):
    canvas_x = MARGIN + (x - min_x) * x_scale
    canvas_y = HEIGHT - MARGIN - (y - min_y) * y_scale
    return canvas_x, canvas_y


# Drawing function
def draw():
    root = tk.Tk()
    canvas = tk.Canvas(root, width=WIDTH, height=HEIGHT)
    canvas.pack()

    # Draw axes
    canvas.create_line(
        MARGIN, HEIGHT - MARGIN, WIDTH - MARGIN, HEIGHT - MARGIN
    )  # X-axis
    canvas.create_line(MARGIN, MARGIN, MARGIN, HEIGHT - MARGIN)  # Y-axis

    # Plot data points
    for x, y in zip(x_values, y_values):
        canvas_x, canvas_y = to_canvas_coordinates(x, y)
        canvas.create_oval(
            canvas_x - 3, canvas_y - 3, canvas_x + 3, canvas_y + 3, fill="blue"
        )

    root.mainloop()


draw()
