import tkinter as tk
import csv
import math

# Constants for canvas size and margins
WIDTH, HEIGHT = 600, 400
MARGIN = 50
LEGEND_X = WIDTH - 120
LEGEND_Y = 30
LEGEND_SPACING = 20

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

# Determine the scale based on data range
min_x, max_x = min(x_values), max(x_values)
min_y, max_y = min(y_values), max(y_values)
x_scale = (WIDTH - 2 * MARGIN) / (max_x - min_x)
y_scale = (HEIGHT - 2 * MARGIN) / (max_y - min_y)

# Assign unique shape to each category
unique_categories = list(set(categories))
category_shapes = {
    category: shape
    for category, shape in zip(unique_categories, ["circle", "square", "triangle"])
}


# Function to find a rounded interval for ticks
def find_tick_interval(data_range):
    ideal_ticks = 10
    raw_interval = data_range / ideal_ticks
    magnitude = 10 ** math.floor(math.log10(raw_interval))
    refined_interval = round(raw_interval / magnitude) * magnitude
    return refined_interval


# Function to convert data point to canvas coordinates
def to_canvas_coordinates(x, y):
    canvas_x = MARGIN + (x - min_x) * x_scale
    canvas_y = HEIGHT - MARGIN - (y - min_y) * y_scale
    return canvas_x, canvas_y


# Shape drawing function
def draw_shape(canvas, shape, x, y, size=10):
    if shape == "circle":
        canvas.create_oval(x - size, y - size, x + size, y + size)
    elif shape == "square":
        canvas.create_rectangle(x - size, y - size, x + size, y + size)
    elif shape == "triangle":
        canvas.create_polygon(x, y - size, x - size, y + size, x + size, y + size)


# Main drawing function
def draw():
    root = tk.Tk()
    canvas = tk.Canvas(root, width=WIDTH, height=HEIGHT)
    canvas.pack()

    # Draw axes
    canvas.create_line(
        MARGIN, HEIGHT - MARGIN, WIDTH - MARGIN, HEIGHT - MARGIN
    )  # X-axis
    canvas.create_line(MARGIN, MARGIN, MARGIN, HEIGHT - MARGIN)  # Y-axis

    # Draw ticks for X-axis
    x_interval = find_tick_interval(max_x - min_x)
    x_start = math.floor(min_x / x_interval) * x_interval
    x_end = math.ceil(max_x / x_interval) * x_interval

    while x_start <= x_end:
        canvas_x = to_canvas_coordinates(x_start, 0)[0]
        canvas.create_line(canvas_x, HEIGHT - MARGIN, canvas_x, HEIGHT - MARGIN + 5)
        canvas.create_text(canvas_x, HEIGHT - MARGIN + 15, text=f"{x_start:.1f}")
        x_start += x_interval

    # Draw ticks for Y-axis
    y_interval = find_tick_interval(max_y - min_y)
    y_start = math.floor(min_y / y_interval) * y_interval
    y_end = math.ceil(max_y / y_interval) * y_interval

    while y_start <= y_end:
        canvas_y = to_canvas_coordinates(0, y_start)[1]
        canvas.create_line(MARGIN - 5, canvas_y, MARGIN, canvas_y)
        canvas.create_text(MARGIN - 20, canvas_y, text=f"{y_start:.1f}")
        y_start += y_interval

    # Plot data points
    for x, y, category in zip(x_values, y_values, categories):
        canvas_x, canvas_y = to_canvas_coordinates(x, y)
        draw_shape(canvas, category_shapes[category], canvas_x, canvas_y)

    # Draw legend
    for i, category in enumerate(unique_categories):
        shape = category_shapes[category]
        y = LEGEND_Y + i * LEGEND_SPACING
        draw_shape(canvas, shape, LEGEND_X - 10, y, size=5)
        canvas.create_text(LEGEND_X, y, text=category, anchor="w")

    root.mainloop()


draw()
