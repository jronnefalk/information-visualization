import tkinter as tk
import csv
import math
import numpy as np

# Constants for canvas size
WIDTH, HEIGHT = 800, 600
CENTER_X, CENTER_Y = WIDTH / 2, HEIGHT / 2

file_path = "data1.csv"


def read_csv(file_path):
    x_values, y_values, categories = [], [], []
    with open(file_path, "r") as file:
        reader = csv.reader(file)
        for row in reader:
            x_values.append(float(row[0]))
            y_values.append(float(row[1]))
            categories.append(row[2])
    return x_values, y_values, categories


def to_canvas_coordinates(x, y, scale, new_origin=None):
    if new_origin:
        x -= new_origin[0]
        y -= new_origin[1]
    canvas_x = CENTER_X + x * scale
    canvas_y = CENTER_Y - y * scale
    return canvas_x, canvas_y


def draw_shape(canvas, shape, x, y, size=5):
    if shape == "circle":
        return canvas.create_oval(x - size, y - size, x + size, y + size, fill="black")
    elif shape == "square":
        return canvas.create_rectangle(
            x - size, y - size, x + size, y + size, fill="black"
        )
    elif shape == "triangle":
        return canvas.create_polygon(
            x, y - size, x - size, y + size, x + size, y + size, fill="black"
        )


def euclidean_distance(p1, p2):
    return np.linalg.norm(np.array(p1) - np.array(p2))


def find_nearest_neighbors(x, y, points, n=5):
    distances = [
        (i, euclidean_distance((x, y), (point[0], point[1])))
        for i, point in enumerate(points)
    ]
    distances.sort(key=lambda x: x[1])
    return [index for index, _ in distances[1 : n + 1]]  # Exclude self


def get_quadrant(x, y):
    if x >= 0 and y >= 0:
        return 1
    elif x < 0 and y >= 0:
        return 2
    elif x < 0 and y < 0:
        return 3
    else:
        return 4


class ScatterPlotApp:
    def __init__(self, root, data_path):
        self.root = root
        self.root.title("Interactive Scatter Plot")
        self.canvas = tk.Canvas(self.root, width=WIDTH, height=HEIGHT)
        self.canvas.pack()

        self.data_path = data_path
        self.x_values, self.y_values, self.categories = read_csv(self.data_path)
        self.data_points = list(zip(self.x_values, self.y_values, self.categories))

        self.overall_min = math.floor(min(min(self.x_values), min(self.y_values)))
        self.overall_max = math.ceil(max(max(self.x_values), max(self.y_values)))
        self.scale = min(WIDTH, HEIGHT) / (self.overall_max - self.overall_min) * 0.9

        self.selected_index = None
        self.use_new_grid = False
        self.highlighted_indexes = []

        self.category_shapes = {}  # Store shapes for each category

        self.draw_static_elements()
        self.redraw()

        self.canvas.bind("<Button-1>", self.on_left_click)
        self.canvas.bind("<Button-3>", self.on_right_click)

    def draw_static_elements(self):
        # Draw axes and ticks
        self.draw_axes()

        # Display legend
        legend_x, legend_y = 50, 50
        self.canvas.create_text(
            legend_x, legend_y, text="Legend", font=("Helvetica", 16, "bold")
        )
        categories = set(self.categories)
        for i, category in enumerate(categories):
            legend_shape_x = legend_x + 120
            legend_shape_y = legend_y + 20 + i * 30
            shape = self.get_shape_for_category(category)
            self.draw_shape(self.canvas, shape, legend_shape_x, legend_shape_y, size=5)
            self.canvas.create_text(
                legend_shape_x + 20, legend_shape_y, text=category, anchor="w"
            )

    def draw_axes(self):
        # Draw X-axis
        self.canvas.create_line(
            to_canvas_coordinates(self.overall_min, 0, self.scale)[0],
            CENTER_Y,
            to_canvas_coordinates(self.overall_max, 0, self.scale)[0],
            CENTER_Y,
            fill="gray",
        )

        # Draw Y-axis
        self.canvas.create_line(
            CENTER_X,
            to_canvas_coordinates(0, self.overall_min, self.scale)[1],
            CENTER_X,
            to_canvas_coordinates(0, self.overall_max, self.scale)[1],
            fill="gray",
        )

        # Draw ticks and tick values
        for x in range(self.overall_min, self.overall_max + 1, int((self.overall_max - self.overall_min) / 10)):
            print(x)
            canvas_x = to_canvas_coordinates(x, 0, self.scale)[0]
            self.canvas.create_line(
                canvas_x,
                CENTER_Y - 5,
                canvas_x,
                CENTER_Y + 5,
                fill="gray",
            )
            self.canvas.create_text(
                canvas_x,
                CENTER_Y + 10,
                text=str(x),
                anchor="n",
            )
        for y in range(self.overall_min, self.overall_max + 1, int((self.overall_max - self.overall_min) / 10)):
            canvas_y = to_canvas_coordinates(0, y, self.scale)[1]
            self.canvas.create_line(
                CENTER_X - 5,
                canvas_y,
                CENTER_X + 5,
                canvas_y,
                fill="gray",
            )
            self.canvas.create_text(
                CENTER_X + 10,
                canvas_y,
                text=str(y),
                anchor="w",
            )

    def draw_shape(self, canvas, shape, x, y, size=5):
        if shape == "circle":
            return canvas.create_oval(
                x - size, y - size, x + size, y + size, fill="black"
            )
        elif shape == "square":
            return canvas.create_rectangle(
                x - size, y - size, x + size, y + size, fill="black"
            )
        elif shape == "triangle":
            return canvas.create_polygon(
                x, y - size, x - size, y + size, x + size, y + size, fill="black"
            )

    def move_points_to_new_origin(self):
        if self.selected_index is not None:
            selected_point = self.data_points[self.selected_index]
            new_origin_x, new_origin_y, _ = selected_point
            for i, (x, y, _) in enumerate(self.data_points):
                self.data_points[i] = (
                    x - new_origin_x,
                    y - new_origin_y,
                    self.categories[i],
                )

    def get_shape_for_category(self, category):
        # If a shape is already assigned to the category, return it
        if category in self.category_shapes:
            return self.category_shapes[category]

        # Assign a shape for the category
        shapes = ["circle", "square", "triangle"]
        shape = shapes[len(self.category_shapes) % len(shapes)]

        # Store the shape for future reference
        self.category_shapes[category] = shape

        return shape

    def redraw(self):
        self.canvas.delete("all")  # Clear the canvas
        self.draw_static_elements()  # Draw static elements like grid and axes
        self.move_points_to_new_origin()

        for i, (x, y, _) in enumerate(self.data_points):
            canvas_x, canvas_y = to_canvas_coordinates(x, y, self.scale)
            shape = self.get_shape_for_category(self.categories[i])

            # Highlight selected origin
            outline_color = "red" if i == self.selected_index else "black"

            # Set colors based on the quadrant
            quadrant = get_quadrant(x, y)
            quadrant_colors = {
                1: "green",
                2: "blue",
                3: "pink",
                4: "brown",
            }
            fill_color = quadrant_colors.get(quadrant, "black")

            # Highlight neighbors
            if i in self.highlighted_indexes:
                fill_color = "orange"

            shape_id = self.draw_shape(self.canvas, shape, canvas_x, canvas_y, size=5)
            self.canvas.itemconfig(shape_id, outline=outline_color, width=2)
            self.canvas.itemconfig(shape_id, fill=fill_color)

    def on_left_click(self, event):
        x, y = (event.x - CENTER_X) / self.scale, (CENTER_Y - event.y) / self.scale
        clicked_index = None
        min_dist = float("inf")
        for i, (point_x, point_y, _) in enumerate(self.data_points):
            dist = euclidean_distance((x, y), (point_x, point_y))
            if dist < min_dist:
                min_dist = dist
                clicked_index = i

        if self.use_new_grid:
            if self.selected_index == clicked_index:
                # Reset the grid to the original
                self.use_new_grid = False
                self.selected_index = None
                self.highlighted_indexes = []
            else:
                self.selected_index = clicked_index
        else:
            self.selected_index = clicked_index
            self.use_new_grid = True

        self.redraw()

    def on_right_click(self, event):
        x, y = (event.x - CENTER_X) / self.scale, (CENTER_Y - event.y) / self.scale
        clicked_index = None
        min_dist = float("inf")
        for i, (point_x, point_y, _) in enumerate(self.data_points):
            dist = euclidean_distance((x, y), (point_x, point_y))
            if dist < min_dist:
                min_dist = dist
                clicked_index = i

        if clicked_index is not None:
            if clicked_index in self.highlighted_indexes:
                self.highlighted_indexes.remove(clicked_index)
            else:
                neighbors = find_nearest_neighbors(
                    self.x_values[clicked_index],
                    self.y_values[clicked_index],
                    self.data_points,
                )
                self.highlighted_indexes = neighbors

        self.redraw()


def main():
    root = tk.Tk()
    app = ScatterPlotApp(root, file_path)
    root.mainloop()


if __name__ == "__main__":
    main()
