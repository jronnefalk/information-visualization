import tkinter as tk
import csv
import math
import numpy as np
from collections import OrderedDict

# Constants for canvas size and tick intervals
WIDTH, HEIGHT = 800, 600
CENTER_X, CENTER_Y = WIDTH / 2, HEIGHT / 2
TICK_SPACING = 100

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

# Determine the overall min and max for both x and y to create a square plot
overall_min = 10 * math.floor(min(min(x_values), min(y_values)) / 10)
overall_max = 10 * math.ceil(max(max(x_values), max(y_values)) / 10)
scale = min(WIDTH, HEIGHT) / 2 / max(abs(overall_min), abs(overall_max) + 5)

# Assign unique shape to each category
unique_categories = sorted(set(categories), key=lambda x: categories.index(x))
category_shapes = OrderedDict(
    (category, shape) for category, shape in zip(unique_categories, ["circle", "square", "triangle"])
)

# Convert data point to canvas coordinates
def to_canvas_coordinates(x, y):
    canvas_x = CENTER_X + x * scale
    canvas_y = CENTER_Y - y * scale
    return canvas_x, canvas_y

# Draw shape function
def draw_shape(canvas, shape, x, y, size=5):
    if shape == "circle":
        return canvas.create_oval(x - size, y - size, x + size, y + size, fill="black")
    elif shape == "square":
        return canvas.create_rectangle(x - size, y - size, x + size, y + size, fill="black")
    elif shape == "triangle":
        return canvas.create_polygon(x, y - size, x - size, y + size, x + size, y + size, fill="black")

# Function to calculate Euclidean distance between two points
def euclidean_distance(p1, p2):
    return np.linalg.norm(np.array(p1) - np.array(p2))

# Function to find the nearest five neighbors based on Euclidean distance
def find_nearest_neighbors(x, y, all_points):
    distances = [(point, euclidean_distance((x, y), (point[0], point[1]))) for point in all_points]
    distances.sort(key=lambda x: x[1])
    return [point[0] for point in distances[:6]]

# Function to handle mouse clicks on data points
def on_data_point_click(event, canvas, data_points, highlighted_points):
    x, y = canvas.canvasx(event.x), canvas.canvasy(event.y)

    if not highlighted_points:
        # Find the nearest five neighbors and highlight them
        neighbors = find_nearest_neighbors(x, y, data_points)
        for point in neighbors:
            canvas.itemconfig(point[2], fill="orange")  # Highlight in orange
            highlighted_points.add(point[2])
    else:
        # Remove highlighting from the selected point and its neighbors
        for point in highlighted_points:
            canvas.itemconfig(point, fill="black")  # Restore the original color
        highlighted_points.clear()

# Main drawing function
def draw():
    root = tk.Tk()
    canvas = tk.Canvas(root, width=WIDTH, height=HEIGHT)
    canvas.pack()

    # Draw axes
    canvas.create_line(0, CENTER_Y, WIDTH, CENTER_Y)  # X-axis
    canvas.create_line(CENTER_X, 0, CENTER_X, HEIGHT)  # Y-axis

    # Draw ticks and their values on X-axis
    for x_tick_value in range(overall_min, overall_max + 1, int((overall_max - overall_min) / 10)):
        canvas_x = to_canvas_coordinates(x_tick_value, 0)[0]
        if canvas_x != CENTER_X:  # Skip the center
            canvas.create_line(canvas_x, CENTER_Y - 10, canvas_x, CENTER_Y + 10)
            canvas.create_text(
                canvas_x,
                CENTER_Y + 20,
                text=str(x_tick_value),
                font=("TkDefaultFont", 10),
            )

    # Draw ticks and their values on Y-axis
    for y_tick_value in range(overall_min, overall_max + 1, int((overall_max - overall_min) / 10)):
        canvas_y = to_canvas_coordinates(0, y_tick_value)[1]
        if canvas_y != CENTER_Y:  # Skip the center
            canvas.create_line(CENTER_X - 10, canvas_y, CENTER_X + 10, canvas_y)
            canvas.create_text(
                CENTER_X - 30,
                canvas_y,
                text=str(y_tick_value),
                font=("TkDefaultFont", 10),
            )

    data_points = []  # Store the data points for later reference

    # Plot data points
    for x, y, category in zip(x_values, y_values, categories):
        canvas_x, canvas_y = to_canvas_coordinates(x, y)
        point = draw_shape(canvas, category_shapes[category], canvas_x, canvas_y)
        data_points.append((canvas_x, canvas_y, point, category))

        # Bind right-click event to data points
        canvas.tag_bind(point, "<Button-3>", lambda event, point=point: on_data_point_click(event, canvas, data_points, highlighted_points))

    # Draw legend
    for i, category in enumerate(unique_categories):
        shape = category_shapes[category]
        y = 20 + i * 30  # Adjust the position of the legend as needed
        draw_shape(
            canvas, shape, WIDTH - 100, y, size=5
        )  # Increased shape size for legend
        canvas.create_text(
            WIDTH - 80, y, text=category, anchor="w", font=("TkDefaultFont", 10)
        )

    root.mainloop()

# Initialize an empty set to store highlighted points
highlighted_points = set()

draw()
