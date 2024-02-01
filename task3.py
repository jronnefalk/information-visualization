import tkinter as tk
import csv
import math

# Constants for canvas size and tick intervals
WIDTH, HEIGHT = 800, 600  # Increased canvas size
CENTER_X, CENTER_Y = WIDTH / 2, HEIGHT / 2
TICK_SPACING = 100  # Increased spacing between ticks in pixels

file_path = "data2.csv"

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


scale = min(WIDTH, HEIGHT) / 2 / max(abs(overall_min), abs(overall_max)+5)

# Assign unique shape to each category
unique_categories = list(set(categories))
category_shapes = {
    category: shape
    for category, shape in zip(unique_categories, ["circle", "square", "triangle"])
}


# Convert data point to canvas coordinates
def to_canvas_coordinates(x, y):
    canvas_x = CENTER_X + x * scale
    canvas_y = CENTER_Y - y * scale
    return canvas_x, canvas_y


# Draw shape function
def draw_shape(canvas, shape, x, y, size=5):  # Increased shape size
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
    canvas.create_line(0, CENTER_Y, WIDTH, CENTER_Y)  # X-axis
    canvas.create_line(CENTER_X, 0, CENTER_X, HEIGHT)  # Y-axis

    # Draw ticks and their values on X-axis
    x_tick_value = overall_min
    while x_tick_value <= overall_max:
        canvas_x = to_canvas_coordinates(x_tick_value, 0)[0]
        if canvas_x != CENTER_X:  # Skip the center
            canvas.create_line(canvas_x, CENTER_Y - 10, canvas_x, CENTER_Y + 10)
            canvas.create_text(
                canvas_x,
                CENTER_Y + 20,
                text=str(round(x_tick_value)),
                font=("TkDefaultFont", 10),
            )
        x_tick_value += overall_max / 10  # Adjust this for different intervals

    # Draw ticks and their values on Y-axis
    y_tick_value = overall_min
    while y_tick_value <= overall_max:
        canvas_y = to_canvas_coordinates(0, y_tick_value)[1]
        if canvas_y != CENTER_Y:  # Skip the center
            canvas.create_line(CENTER_X - 10, canvas_y, CENTER_X + 10, canvas_y)
            canvas.create_text(
                CENTER_X - 30,
                canvas_y,
                text=str(round(y_tick_value)),
                font=("TkDefaultFont", 10),
            )
        y_tick_value += overall_max / 10  # Adjust this for different intervals

    # Plot data points
    for x, y, category in zip(x_values, y_values, categories):
        canvas_x, canvas_y = to_canvas_coordinates(x, y)
        draw_shape(canvas, category_shapes[category], canvas_x, canvas_y)

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


draw()
