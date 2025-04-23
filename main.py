# Import necessary libraries
import pygame
import sys
import os
import random
import datetime
import csv

# --- Constants and Configuration (SHARED) ---
SCREEN_WIDTH = 1000
SCREEN_HEIGHT = 700
WINDOW_TITLE = "Problem Solving Tasks"
FPS = 60
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GRAY = (200, 200, 200)
LIGHT_GRAY = (230, 230, 230)
DARK_GRAY = (100, 100, 100)
RED = (200, 0, 0)
GREEN = (0, 200, 0)
BLUE = (0, 0, 200)
IMAGE_DIR = "images"
DATA_FILE = "multi_task_fixedness_data_v2.csv"  # Updated filename
NUM_CONDITIONS = 2  # 0: w.p. (control), 1: a.p. (fixedness)

# Shared Layout Constants
INVENTORY_RECT_GLOBAL = pygame.Rect(0, SCREEN_HEIGHT - 150, SCREEN_WIDTH, 150)
WORKSPACE_RECT_GLOBAL = pygame.Rect(
    0, 0, SCREEN_WIDTH, SCREEN_HEIGHT - INVENTORY_RECT_GLOBAL.height)

# --- Asset Loading Cache ---
IMAGE_CACHE = {}


def load_image(filename, size=None, use_colorkey=False, colorkey_color=BLACK):
    cache_key = (filename, size)
    if cache_key in IMAGE_CACHE:
        return IMAGE_CACHE[cache_key]
    path = os.path.join(IMAGE_DIR, filename)
    try:
        image = pygame.image.load(path)
    except pygame.error as e:
        print(f"Error loading image: {path} - {e}")
        error_surf = pygame.Surface(size if size else (50, 50))
        error_surf.fill(RED)
        pygame.draw.rect(error_surf, BLACK, error_surf.get_rect(), 1)
        # Simplified error text drawing
        font = pygame.font.Font(None, 24)
        text_surf = font.render("!", True, BLACK)
        text_rect = text_surf.get_rect(center=error_surf.get_rect().center)
        error_surf.blit(text_surf, text_rect)
        IMAGE_CACHE[cache_key] = error_surf.convert_alpha()
        return IMAGE_CACHE[cache_key]
    image = image.convert_alpha()
    if size:
        image = pygame.transform.scale(image, size)
    if use_colorkey:
        image.set_colorkey(colorkey_color)
    IMAGE_CACHE[cache_key] = image
    return image

# --- Utility Functions ---


def draw_text(surface, text, size, x, y, color=BLACK, font_name=None, center=False):
    try:
        font = pygame.font.Font(font_name, size)
    except IOError:
        font = pygame.font.Font(None, size)  # Fallback font
    text_surface = font.render(text, True, color)
    text_rect = text_surface.get_rect()
    if center:
        text_rect.center = (x, y)
    else:
        text_rect.topleft = (x, y)
    surface.blit(text_surface, text_rect)
    return text_rect


def draw_multiline_text(surface, text, size, rect, color=BLACK, font_name=None, aa=True, bkg=None):
    try:
        font = pygame.font.Font(font_name, size)
    except IOError:
        font = pygame.font.Font(None, size)  # Fallback font
    y = rect.top
    line_spacing = -2
    # Use get_linesize() for better spacing estimate
    font_height = font.get_linesize()
    while text:
        i = 1
        if y + font_height > rect.bottom:
            break
        while font.size(text[:i])[0] < rect.width and i < len(text):
            i += 1
        if i < len(text):
            i = text.rfind(" ", 0, i) + \
                1 if " " in text[:i] else i  # Ensure word wrap
        image = font.render(text[:i].strip(), aa, color, bkg)
        if bkg:
            image.set_colorkey(bkg)
        surface.blit(image, (rect.left, y))
        y += font_height + line_spacing
        text = text[i:]
    return text


def generate_participant_id():
    now = datetime.datetime.now()
    return now.strftime("%Y%m%d_%H%M%S") + "_" + str(random.randint(1000, 9999))


# --- Data Logging Setup and Function (Expanded Fields) ---
CSV_FIELDNAMES = [
    "ParticipantID", "TaskIndex", "TaskName", "AssignedCondition",
    "StartTime", "EndTime", "DurationSeconds", "Outcome",
    "TotalActions", "IncorrectDrops",
    # Task-specific outcome flags
    "BoxOnWall", "BoxTacked",  # Candle Task
    "KatoriInverted", "ObjectStable",  # Katori Task
    "HangerTransformed", "RingRetrieved",  # Hanger Task
    "BookPlaced", "BridgePlaced", "CarCrossed",  # Bridge Task
    "ActionLog"
]


def setup_data_logging():
    # ... (Same as before, ensures header uses CSV_FIELDNAMES) ...
    file_exists = os.path.isfile(DATA_FILE)
    try:
        with open(DATA_FILE, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            if not file_exists or os.path.getsize(DATA_FILE) == 0:
                writer.writerow(CSV_FIELDNAMES)
    except IOError as e:
        print(
            f"Error setting up data file '{DATA_FILE}': {e}")
        raise SystemExit(e)


def log_data(data_dict):
    # ... (Same as before, uses CSV_FIELDNAMES to ensure all keys) ...
    try:
        for key in CSV_FIELDNAMES:
            data_dict.setdefault(key, None)
        with open(DATA_FILE, 'a', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=CSV_FIELDNAMES)
            f.seek(0, os.SEEK_END)
            if f.tell() == 0:
                writer.writeheader()
            writer.writerow(data_dict)
    except IOError as e:
        print(f"Error writing data to '{DATA_FILE}': {e}")
    except Exception as e:
        print(f"An unexpected error occurred during data logging: {e}")

# --- Draggable Item Class (Keep Generic) ---


class DraggableItem(pygame.sprite.Sprite):
    # ... (Same generic class as in previous multi-task version) ...
    def __init__(self, image_filename, size, initial_pos, item_type, initial_image=None):
        super().__init__()
        self.image_filename = image_filename
        self.size = size
        self.item_type = item_type
        self.is_placed = False
        self.is_transformed = False
        self.is_attached_to = None
        self.state = 0
        if initial_image:
            self.original_image = initial_image
        else:
            self.original_image = load_image(image_filename, size)
        self.image = self.original_image.copy()
        self.rect = self.image.get_rect(topleft=initial_pos)
        self.initial_pos = initial_pos
        self.current_pos = initial_pos
        self.dragging = False
        self.offset = (0, 0)

    def handle_event(self, event):
        if event.type == pygame.MOUSEBUTTONDOWN:
            if event.button == 1 and self.rect.collidepoint(event.pos):
                self.dragging = True
                self.offset = (
                    self.rect.x - event.pos[0], self.rect.y - event.pos[1])
                return True
        elif event.type == pygame.MOUSEBUTTONUP:
            if event.button == 1 and self.dragging:
                self.dragging = False
                return True
        return False

    def update(self, mouse_pos):
        if self.dragging:
            self.rect.x = mouse_pos[0] + self.offset[0]
            self.rect.y = mouse_pos[1] + self.offset[1]
            self.current_pos = self.rect.topleft

    def reset_position(self):
        self.rect.topleft = self.initial_pos
        self.current_pos = self.initial_pos
        self.is_placed = False
        self.state = 0  # Reset generic state

    def draw(self, surface):
        surface.blit(self.image, self.rect)

    def change_visual(self, new_image_filename, new_size, new_item_type=None):
        self.image_filename = new_image_filename
        self.size = new_size
        if new_item_type:
            self.item_type = new_item_type
        new_image = load_image(self.image_filename, self.size)
        self.original_image = new_image
        self.image = self.original_image.copy()
        old_center = self.rect.center
        self.rect = self.image.get_rect(center=old_center)

# --- Screen Function (Generic Information Screen) ---


def show_screen(screen, clock, title_text, instruction_text, button_text="Press any key to continue", title_size=48, text_size=24, button_size=22):
    # ... (same function) ...
    screen.fill(BLUE)
    title_rect = draw_text(screen, title_text, title_size,
                           SCREEN_WIDTH // 2, SCREEN_HEIGHT // 4, WHITE, center=True)
    instruction_rect = pygame.Rect(
        100, title_rect.bottom + 30, SCREEN_WIDTH - 200, SCREEN_HEIGHT // 2 + 20)
    pygame.draw.rect(screen, LIGHT_GRAY, instruction_rect, border_radius=10)
    pygame.draw.rect(screen, BLACK, instruction_rect,
                     width=2, border_radius=10)
    draw_multiline_text(screen, instruction_text, text_size,
                        instruction_rect.inflate(-20, -20), BLACK)
    draw_text(screen, button_text, button_size, SCREEN_WIDTH //
              2, instruction_rect.bottom + 40, WHITE, center=True)
    pygame.display.flip()
    waiting = True
    while waiting:
        clock.tick(FPS)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if event.type == pygame.KEYDOWN or event.type == pygame.MOUSEBUTTONDOWN:
                waiting = False

# --- Task Runner Functions ---


def run_candle_box_task(screen, clock, participant_id, task_condition):
    """Runs the original Candle Box task."""
    TASK_NAME = "CandleBox"
    TIMEOUT_SECONDS = 180  # 3 minutes
    start_time = datetime.datetime.now()
    action_log = []
    action_count = 0
    incorrect_drops = 0
    box_on_wall_flag = False  # Specific flags for this task
    box_tacked_flag = False
    print(
        f"Starting Task: {TASK_NAME}, Condition: {'w.p.' if task_condition == 0 else 'a.p.'}")

    # Task Specific Setup
    sprites = pygame.sprite.Group()
    draggables = []
    inventory_rect = INVENTORY_RECT_GLOBAL
    workspace_rect = WORKSPACE_RECT_GLOBAL
    # Specific wall area for this task
    wall_area_rect = pygame.Rect(
        SCREEN_WIDTH // 2 - 150, 50, 300, workspace_rect.height - 100)
    wall_bg = load_image("wall_texture.png", wall_area_rect.size) if os.path.exists(
        os.path.join(IMAGE_DIR, "wall_texture.png")) else None

    # Objects
    box_size = (80, 80)
    candle_size = (30, 100)
    tacks_size = (40, 40)
    inv_y = inventory_rect.centery - box_size[1] // 2
    item_spacing = 150
    candle_pos = (inventory_rect.centerx - item_spacing * 1.5, inv_y)
    box_pos = (inventory_rect.centerx - box_size[0] // 2, inv_y)
    tacks_pos = (inventory_rect.centerx + item_spacing * 1.5 -
                 tacks_size[0], inv_y + box_size[1] // 2 - tacks_size[1] // 2)

    candle = DraggableItem("candle.png", candle_size, candle_pos, 'candle')

    box_image_file = "box.png"
    if task_condition == 1:  # a.p.
        box_image_file = "box_with_tacks.png" if os.path.exists(
            os.path.join(IMAGE_DIR, "box_with_tacks.png")) else "box.png"
        # Adjust tacks position if box contains them visually
        tacks_pos = (box_pos[0] + box_size[0] // 2 - tacks_size[0] //
                     2, box_pos[1] + box_size[1] // 2 - tacks_size[1] // 2)

    box = DraggableItem(box_image_file, box_size, box_pos, 'box')
    tacks = DraggableItem("tacks.png", tacks_size, tacks_pos, 'tacks')

    draggables.extend([candle, box, tacks])
    sprites.add(candle, box, tacks)

    # Task Loop
    running = True
    currently_dragged = None
    outcome = "Timeout"
    start_ticks = pygame.time.get_ticks()

    while running:
        clock.tick(FPS)
        mouse_pos = pygame.mouse.get_pos()
        elapsed_seconds = (pygame.time.get_ticks() - start_ticks) / 1000
        remaining_seconds = max(0, TIMEOUT_SECONDS - elapsed_seconds)

        # Event Handling
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
                for item in reversed(draggables):
                    if item.handle_event(event):
                        currently_dragged = item
                        action_log.append(
                            f"{elapsed_seconds:.2f}s - DRAG_START({item.item_type})")
                        action_count += 1
                        sprites.remove(item)
                        sprites.add(item)
                        break
            if event.type == pygame.MOUSEBUTTONUP and event.button == 1:
                if currently_dragged:
                    action_log.append(
                        f"{elapsed_seconds:.2f}s - DRAG_END({currently_dragged.item_type}) at {currently_dragged.rect.center}")
                    action_count += 1
                    dropped_successfully = False
                    # Drop Logic
                    # 1. Box onto Wall
                    if currently_dragged.item_type == 'box' and currently_dragged.rect.colliderect(wall_area_rect):
                        currently_dragged.rect.centerx = wall_area_rect.centerx
                        currently_dragged.rect.bottom = wall_area_rect.bottom - 20
                        currently_dragged.is_placed = True
                        box_on_wall_flag = True
                        action_log.append(
                            f"{elapsed_seconds:.2f}s - PLACE(Box on Wall)")
                        dropped_successfully = True
                    # 2. Tacks onto Box (on Wall)
                    elif currently_dragged.item_type == 'tacks' and box.is_placed and currently_dragged.rect.colliderect(box.rect):
                        # Mark box as tacked (using generic state)
                        box.state = 1
                        box_tacked_flag = True
                        currently_dragged.kill()
                        draggables.remove(currently_dragged)  # Remove tacks
                        action_log.append(
                            f"{elapsed_seconds:.2f}s - ACTION(Tack Box)")
                        dropped_successfully = True
                    # 3. Candle onto Tacked Box
                    elif currently_dragged.item_type == 'candle' and box.state == 1 and currently_dragged.rect.colliderect(box.rect):
                        currently_dragged.rect.midbottom = (
                            box.rect.centerx, box.rect.top)
                        currently_dragged.is_placed = True
                        action_log.append(
                            f"{elapsed_seconds:.2f}s - PLACE(Candle on Box)")
                        dropped_successfully = True
                        outcome = "Solved"
                        running = False  # *** SOLUTION ***

                    # Invalid Drop
                    if not dropped_successfully:
                        if not inventory_rect.contains(currently_dragged.rect):
                            incorrect_drops += 1
                        # Allow box to stay on wall even if not tacked yet
                        if not (currently_dragged.item_type == 'box' and currently_dragged.is_placed):
                            currently_dragged.reset_position()

                    # Finalize drag
                    if currently_dragged:
                        currently_dragged.handle_event(event)
                    currently_dragged = None

        # Update
        if currently_dragged:
            currently_dragged.update(mouse_pos)
        # Check Timeout
        if remaining_seconds <= 0 and running:
            outcome = "Timeout"
            running = False

        # Drawing
        screen.fill(WHITE)
        pygame.draw.rect(screen, LIGHT_GRAY, inventory_rect)
        # Draw Wall
        if wall_bg:
            screen.blit(wall_bg, wall_area_rect.topleft)
        else:
            pygame.draw.rect(screen, GRAY, wall_area_rect)
            pygame.draw.rect(screen, BLACK, wall_area_rect, 3)
        sprites.draw(screen)
        timer_text = f"Task 1: Candle Box | Time: {int(remaining_seconds // 60):02}:{int(remaining_seconds % 60):02}"
        draw_text(screen, timer_text, 20, SCREEN_WIDTH - 250, 5, BLACK)
        pygame.display.flip()

    # Task End & Data Return
    end_time = datetime.datetime.now()
    data = {
        "Outcome": outcome, "DurationSeconds": round((end_time - start_time).total_seconds(), 2),
        "TotalActions": action_count, "IncorrectDrops": incorrect_drops,
        "BoxOnWall": box_on_wall_flag, "BoxTacked": box_tacked_flag,  # Specific flags
        "ActionLog": " | ".join(action_log), "StartTime": start_time.strftime("%Y-%m-%d %H:%M:%S"),
        "EndTime": end_time.strftime("%Y-%m-%d %H:%M:%S"), "TaskName": TASK_NAME
    }
    return data


def run_katori_stand_task(screen, clock, participant_id, task_condition):
    # ... (Function definition exactly as in the previous multi-task version) ...
    # Make sure TASK_NAME = "KatoriStand"
    # Add "KatoriInverted", "ObjectStable" to returned data dict keys
    TASK_NAME = "KatoriStand"
    TIMEOUT_SECONDS = 180
    start_time = datetime.datetime.now()
    action_log = []
    action_count = 0
    incorrect_drops = 0
    katori_inverted_flag = False
    object_stable_flag = False
    print(
        f"Starting Task: {TASK_NAME}, Condition: {'w.p.' if task_condition == 0 else 'a.p.'}")
    sprites = pygame.sprite.Group()
    draggables = []
    inventory_rect = INVENTORY_RECT_GLOBAL
    workspace_rect = WORKSPACE_RECT_GLOBAL
    table_rect = workspace_rect.inflate(-100, -150)
    katori_size = (80, 50)
    object_size = (40, 40)
    katori_pos = (inventory_rect.centerx -
                  katori_size[0]*1.5, inventory_rect.centery - katori_size[1]//2)
    object_pos = (inventory_rect.centerx +
                  katori_size[0]*0.5, inventory_rect.centery - object_size[1]//2)
    katori_img = "katori.png"
    if task_condition == 1:
        if os.path.exists(os.path.join(IMAGE_DIR, "katori_with_contents.png")):
            katori_img = "katori_with_contents.png"
    katori = DraggableItem(katori_img, katori_size, katori_pos, 'katori')
    object_to_stabilize = DraggableItem(
        "diya.png", object_size, object_pos, 'object')
    draggables.extend([katori, object_to_stabilize])
    sprites.add(katori, object_to_stabilize)
    running = True
    currently_dragged = None
    outcome = "Timeout"
    start_ticks = pygame.time.get_ticks()
    while running:
        clock.tick(FPS)
        mouse_pos = pygame.mouse.get_pos()
        elapsed_seconds = (pygame.time.get_ticks() - start_ticks) / 1000
        remaining_seconds = max(0, TIMEOUT_SECONDS - elapsed_seconds)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
                for item in reversed(draggables):
                    if item.handle_event(event):
                        currently_dragged = item
                        action_log.append(
                            f"{elapsed_seconds:.2f}s - DRAG_START({item.item_type})")
                        action_count += 1
                        sprites.remove(item)
                        sprites.add(item)
                        break
            if event.type == pygame.MOUSEBUTTONUP and event.button == 1:
                if currently_dragged:
                    action_log.append(
                        f"{elapsed_seconds:.2f}s - DRAG_END({currently_dragged.item_type}) at {currently_dragged.rect.center}")
                    action_count += 1
                    dropped_successfully = False
                    if currently_dragged.item_type == 'katori' and table_rect.contains(currently_dragged.rect):
                        currently_dragged.is_placed = True
                        katori_inverted_flag = True
                        action_log.append(
                            f"{elapsed_seconds:.2f}s - PLACE(Katori on Table)")
                        dropped_successfully = True
                    elif currently_dragged.item_type == 'object' and katori.is_placed and currently_dragged.rect.colliderect(katori.rect):
                        currently_dragged.rect.midbottom = katori.rect.midtop
                        currently_dragged.is_placed = True
                        object_stable_flag = True
                        action_log.append(
                            f"{elapsed_seconds:.2f}s - PLACE(Object on Katori)")
                        dropped_successfully = True
                        outcome = "Solved"
                        running = False
                    if not dropped_successfully:
                        if not inventory_rect.contains(currently_dragged.rect):
                            incorrect_drops += 1
                        # Don't reset placed katori
                        if not (currently_dragged.item_type == 'katori' and currently_dragged.is_placed):
                            currently_dragged.reset_position()
                    if currently_dragged:
                        currently_dragged.handle_event(
                            event)
                        currently_dragged = None
        if currently_dragged:
            currently_dragged.update(mouse_pos)
        if remaining_seconds <= 0 and running:
            outcome = "Timeout"
            running = False
        screen.fill(WHITE)
        pygame.draw.rect(screen, LIGHT_GRAY, inventory_rect)
        pygame.draw.rect(
            screen, GRAY, table_rect, border_radius=5)
        sprites.draw(screen)
        # Update Task Number
        timer_text = f"Task 2: Katori Stand | Time: {int(remaining_seconds // 60):02}:{int(remaining_seconds % 60):02}"
        draw_text(screen, timer_text, 20, SCREEN_WIDTH - 250, 5, BLACK)
        pygame.display.flip()
    end_time = datetime.datetime.now()
    data = {"Outcome": outcome, "DurationSeconds": round((end_time - start_time).total_seconds(), 2),
            "TotalActions": action_count, "IncorrectDrops": incorrect_drops, "KatoriInverted": katori_inverted_flag, "ObjectStable": object_stable_flag,
            "ActionLog": " | ".join(action_log), "StartTime": start_time.strftime("%Y-%m-%d %H:%M:%S"),
            "EndTime": end_time.strftime("%Y-%m-%d %H:%M:%S"), "TaskName": TASK_NAME}
    return data


def run_hanger_wire_task(screen, clock, participant_id, task_condition):
    # ... (Function definition exactly as in the previous multi-task version) ...
    # Make sure TASK_NAME = "HangerWire"
    # Add "RingRetrieved" to returned data dict keys
    TASK_NAME = "HangerWire"
    TIMEOUT_SECONDS = 240
    start_time = datetime.datetime.now()
    action_log = []
    action_count = 0
    incorrect_drops = 0
    hanger_transformed_flag = False
    ring_retrieved_flag = False
    print(
        f"Starting Task: {TASK_NAME}, Condition: {'w.p.' if task_condition == 0 else 'a.p.'}")
    sprites = pygame.sprite.Group()
    draggables = []
    inventory_rect = INVENTORY_RECT_GLOBAL
    workspace_rect = WORKSPACE_RECT_GLOBAL
    gap_area_rect = pygame.Rect(
        SCREEN_WIDTH // 2 - 40, SCREEN_HEIGHT // 2 - 100 - 50, 80, 200)
    gap_image = load_image("gap.png", gap_area_rect.size)
    hanger_size = (120, 80)
    wire_size = (10, 100)
    ring_size = (25, 25)
    dist_size = (50, 50)
    ring_pos = (gap_area_rect.centerx -
                ring_size[0]//2, gap_area_rect.bottom - ring_size[1] - 10)
    ring = DraggableItem("ring.png", ring_size, ring_pos, 'ring')
    sprites.add(ring)
    hanger_pos = (inventory_rect.centerx - 150,
                  inventory_rect.centery - hanger_size[1]//2)
    hanger_img = "hanger.png"
    if task_condition == 1:
        if os.path.exists(os.path.join(IMAGE_DIR, "hanger_with_shirt.png")):
            hanger_img = "hanger_with_shirt.png"
    hanger = DraggableItem(hanger_img, hanger_size, hanger_pos, 'hanger')
    distractor1 = DraggableItem(
        "distractor_cloth.png", dist_size, (hanger_pos[0]+180, hanger_pos[1]+15), 'cloth')
    draggables.extend([hanger, distractor1])
    sprites.add(hanger, distractor1)
    running = True
    currently_dragged = None
    outcome = "Timeout"
    wire_sprite = None
    ring_is_attached = False
    start_ticks = pygame.time.get_ticks()
    while running:
        clock.tick(FPS)
        mouse_pos = pygame.mouse.get_pos()
        elapsed_seconds = (pygame.time.get_ticks() - start_ticks) / 1000
        remaining_seconds = max(0, TIMEOUT_SECONDS - elapsed_seconds)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
                items_to_check = ([wire_sprite] if wire_sprite else [
                ]) + list(reversed(draggables))
                for item in items_to_check:
                    if item and item.handle_event(event):
                        currently_dragged = item
                        action_log.append(
                            f"{elapsed_seconds:.2f}s - DRAG_START({item.item_type})")
                        action_count += 1
                        if item in sprites:
                            sprites.remove(item)
                            sprites.add(item)
                            break
            if event.type == pygame.MOUSEBUTTONUP and event.button == 1:
                if currently_dragged:
                    action_log.append(
                        f"{elapsed_seconds:.2f}s - DRAG_END({currently_dragged.item_type}) at {currently_dragged.rect.center}")
                    action_count += 1
                    original_item_type = currently_dragged.item_type
                    dropped_successfully = False
                    if currently_dragged.item_type == 'hanger' and workspace_rect.contains(currently_dragged.rect):
                        currently_dragged.change_visual(
                            "wire_piece.png", wire_size, new_item_type='wire')
                        currently_dragged.is_transformed = True
                        hanger_transformed_flag = True
                        wire_sprite = currently_dragged
                        if hanger in draggables:
                            draggables.remove(hanger)
                        action_log.append(
                            f"{elapsed_seconds:.2f}s - TRANSFORM(Hanger to Wire)")
                        dropped_successfully = True
                    elif currently_dragged.item_type == 'wire' and currently_dragged.rect.colliderect(ring.rect) and gap_area_rect.contains(ring.rect):
                        ring_is_attached = True
                        currently_dragged.is_attached_to = ring
                        ring.is_attached_to = currently_dragged
                        action_log.append(
                            f"{elapsed_seconds:.2f}s - ATTACH(Wire to Ring)")
                        dropped_successfully = True
                    elif currently_dragged.item_type == 'wire' and ring_is_attached and not gap_area_rect.contains(currently_dragged.rect.center):
                        ring_retrieved_flag = True
                        action_log.append(
                            f"{elapsed_seconds:.2f}s - RETRIEVE(Ring with Wire)")
                        dropped_successfully = True
                        outcome = "Solved"
                        running = False
                    if not dropped_successfully:
                        if original_item_type != 'wire' and not inventory_rect.contains(currently_dragged.rect):
                            incorrect_drops += 1
                            currently_dragged.reset_position()
                        elif original_item_type == 'wire' and not gap_area_rect.contains(currently_dragged.rect):
                            action_log.append(
                                f"{elapsed_seconds:.2f}s - PLACE(Wire at {currently_dragged.rect.center})")
                        elif not inventory_rect.contains(currently_dragged.rect):
                            incorrect_drops += 1
                            currently_dragged.reset_position()
                    if currently_dragged:
                        currently_dragged.handle_event(event)
                        currently_dragged = None
        if currently_dragged:
            currently_dragged.update(mouse_pos)
            if currently_dragged.item_type == 'wire' and ring_is_attached:
                ring.rect.center = (currently_dragged.rect.centerx,
                                    currently_dragged.rect.bottom - ring.rect.height // 2)
        if remaining_seconds <= 0 and running:
            outcome = "Timeout"
            running = False
        screen.fill(WHITE)
        pygame.draw.rect(screen, LIGHT_GRAY, inventory_rect)
        if gap_image:
            screen.blit(gap_image, gap_area_rect.topleft)
        else:
            pygame.draw.rect(screen, DARK_GRAY, gap_area_rect)
            pygame.draw.rect(screen, BLACK, gap_area_rect, 2)
        sprites.draw(screen)
        # Update Task Number
        timer_text = f"Task 3: Hanger Wire | Time: {int(remaining_seconds // 60):02}:{int(remaining_seconds % 60):02}"
        draw_text(screen, timer_text, 20, SCREEN_WIDTH - 250, 5, BLACK)
        pygame.display.flip()
    end_time = datetime.datetime.now()
    data = {"Outcome": outcome, "DurationSeconds": round((end_time - start_time).total_seconds(), 2),
            "TotalActions": action_count, "IncorrectDrops": incorrect_drops, "HangerTransformed": hanger_transformed_flag, "RingRetrieved": ring_retrieved_flag,
            "ActionLog": " | ".join(action_log), "StartTime": start_time.strftime("%Y-%m-%d %H:%M:%S"),
            "EndTime": end_time.strftime("%Y-%m-%d %H:%M:%S"), "TaskName": TASK_NAME}
    return data


def run_bridge_support_task(screen, clock, participant_id, task_condition):
    # ... (Function definition exactly as in the previous multi-task version) ...
    # Make sure TASK_NAME = "BridgeSupport"
    # Add "BookPlaced", "BridgePlaced", "CarCrossed" to returned data dict keys
    TASK_NAME = "BridgeSupport"
    TIMEOUT_SECONDS = 240
    start_time = datetime.datetime.now()
    action_log = []
    action_count = 0
    incorrect_drops = 0
    book_placed_flag = False
    bridge_placed_flag = False
    car_crossed_flag = False
    print(
        f"Starting Task: {TASK_NAME}, Condition: {'w.p.' if task_condition == 0 else 'a.p.'}")
    sprites = pygame.sprite.Group()
    draggables = []
    inventory_rect = INVENTORY_RECT_GLOBAL
    workspace_rect = WORKSPACE_RECT_GLOBAL
    platform_y = workspace_rect.centery + 50
    platform_height = 150
    platform_width = 300
    gap_width = 150
    left_platform_rect = pygame.Rect(
        workspace_rect.left + 50, platform_y, platform_width, platform_height)
    right_platform_rect = pygame.Rect(
        left_platform_rect.right + gap_width, platform_y, platform_width, platform_height)
    gap_rect = pygame.Rect(left_platform_rect.right,
                           platform_y, gap_width, platform_height)
    book_size = (100, 30)
    ruler_size = (gap_width + platform_width // 2, 20)
    car_size = (50, 30)
    book_pos = (inventory_rect.centerx -
                book_size[0]*2, inventory_rect.centery - book_size[1]//2)
    ruler_pos = (inventory_rect.centerx,
                 inventory_rect.centery - ruler_size[1]//2)
    car_pos = (inventory_rect.centerx +
               book_size[0]*2, inventory_rect.centery - car_size[1]//2)
    book_img = "book_closed.png"
    if task_condition == 1:
        # Adjust size if needed: book_size = (100, 70)
        book_img = "book_open.png"
    book = DraggableItem(book_img, book_size, book_pos, 'book')
    ruler = DraggableItem("ruler.png", ruler_size, ruler_pos, 'ruler')
    car = DraggableItem("toy_car.png", car_size, car_pos, 'car')
    draggables.extend([book, ruler, car])
    sprites.add(book, ruler, car)
    running = True
    currently_dragged = None
    outcome = "Timeout"
    start_ticks = pygame.time.get_ticks()
    car_on_bridge = False
    while running:
        clock.tick(FPS)
        mouse_pos = pygame.mouse.get_pos()
        elapsed_seconds = (pygame.time.get_ticks() - start_ticks) / 1000
        remaining_seconds = max(0, TIMEOUT_SECONDS - elapsed_seconds)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
                for item in reversed(draggables):
                    if item.handle_event(event):
                        currently_dragged = item
                        action_log.append(
                            f"{elapsed_seconds:.2f}s - DRAG_START({item.item_type})")
                        action_count += 1
                        sprites.remove(item)
                        sprites.add(item)
                        break
            if event.type == pygame.MOUSEBUTTONUP and event.button == 1:
                if currently_dragged:
                    action_log.append(
                        f"{elapsed_seconds:.2f}s - DRAG_END({currently_dragged.item_type}) at {currently_dragged.rect.center}")
                    action_count += 1
                    dropped_successfully = False
                    if currently_dragged.item_type == 'book' and gap_rect.contains(currently_dragged.rect.center):
                        if task_condition == 1:
                            currently_dragged.change_visual(
                                "book_closed.png", (100, 30))
                        currently_dragged.rect.midbottom = gap_rect.midbottom
                        currently_dragged.is_placed = True
                        book_placed_flag = True
                        action_log.append(
                            f"{elapsed_seconds:.2f}s - PLACE(Book in Gap)")
                        dropped_successfully = True
                    elif currently_dragged.item_type == 'ruler' and book.is_placed:
                        is_on_book = currently_dragged.rect.colliderect(
                            book.rect)
                        if is_on_book and abs(currently_dragged.rect.centery - left_platform_rect.top) < 15:
                            currently_dragged.rect.centery = left_platform_rect.top + \
                                ruler_size[1]//2
                            currently_dragged.is_placed = True
                            bridge_placed_flag = True
                            action_log.append(
                                f"{elapsed_seconds:.2f}s - PLACE(Ruler as Bridge)")
                            dropped_successfully = True
                    elif currently_dragged.item_type == 'car' and ruler.is_placed and currently_dragged.rect.colliderect(ruler.rect):
                        if currently_dragged.rect.colliderect(left_platform_rect):
                            currently_dragged.rect.midleft = (
                                left_platform_rect.right - 5, ruler.rect.centery)
                            currently_dragged.is_placed = True
                            car_on_bridge = True
                            action_log.append(
                                f"{elapsed_seconds:.2f}s - PLACE(Car on Bridge Start)")
                            dropped_successfully = True
                    elif currently_dragged.item_type == 'car' and car_on_bridge and currently_dragged.rect.colliderect(right_platform_rect):
                        car_crossed_flag = True
                        action_log.append(
                            f"{elapsed_seconds:.2f}s - MOVE(Car Across Bridge)")
                        dropped_successfully = True
                        outcome = "Solved"
                        running = False
                    if not dropped_successfully:
                        if not inventory_rect.contains(currently_dragged.rect):
                            incorrect_drops += 1
                        if currently_dragged.item_type == 'car' and car_on_bridge:
                            car_on_bridge = False
                            currently_dragged.reset_position()
                        elif not currently_dragged.is_placed:
                            currently_dragged.reset_position()  # Reset if not correctly placed yet
                    if currently_dragged:
                        currently_dragged.handle_event(event)
                        currently_dragged = None
        if currently_dragged:
            currently_dragged.update(mouse_pos)
        if remaining_seconds <= 0 and running:
            outcome = "Timeout"
            running = False
        screen.fill(WHITE)
        pygame.draw.rect(screen, LIGHT_GRAY, inventory_rect)
        pygame.draw.rect(screen, DARK_GRAY,
                         left_platform_rect, border_radius=5)
        pygame.draw.rect(screen, DARK_GRAY,
                         right_platform_rect, border_radius=5)
        sprites.draw(screen)
        # Update Task Number
        timer_text = f"Task 4: Bridge Support | Time: {int(remaining_seconds // 60):02}:{int(remaining_seconds % 60):02}"
        draw_text(screen, timer_text, 20, SCREEN_WIDTH - 250, 5, BLACK)
        pygame.display.flip()
    end_time = datetime.datetime.now()
    data = {"Outcome": outcome, "DurationSeconds": round((end_time - start_time).total_seconds(), 2),
            "TotalActions": action_count, "IncorrectDrops": incorrect_drops, "BookPlaced": book_placed_flag, "BridgePlaced": bridge_placed_flag, "CarCrossed": car_crossed_flag,
            "ActionLog": " | ".join(action_log), "StartTime": start_time.strftime("%Y-%m-%d %H:%M:%S"),
            "EndTime": end_time.strftime("%Y-%m-%d %H:%M:%S"), "TaskName": TASK_NAME}
    return data


# --- Main Execution Loop ---
def main():
    pygame.init()
    if not pygame.font:
        print('Warning, fonts disabled')
        sys.exit()  # Font check
    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    pygame.display.set_caption(WINDOW_TITLE)
    clock = pygame.time.Clock()
    setup_data_logging()

    # Participant Setup
    participant_id = generate_participant_id()
    participant_id_numeric = int(participant_id.split('_')[-1])
    print(f"Participant ID: {participant_id}")

    # Define Task Sequence (Now includes Candle Box as first task)
    tasks = [
        (run_candle_box_task, "Task 1: Candle Box\n\nYour task is to affix the candle to the wall so it burns properly without dripping wax on the surface below using the items provided."),
        (run_katori_stand_task, "Task 2: Katori Stand\n\nYour goal is to make the small object (diya) stand stable on the table surface using the items provided."),
        (run_hanger_wire_task, "Task 3: Hanger Wire\n\nYour task is to retrieve the small ring that has fallen into the narrow gap shown on the screen using the items provided."),
        (run_bridge_support_task, "Task 4: Bridge Support\n\nYour task is to get the toy car across the gap between the two platforms using the items provided.")
    ]
    random.shuffle(tasks)  # Randomize task order for each participant

    # Welcome Screen
    show_screen(screen, clock, "Welcome to the Experiment",
                f"Thank you for participating.\n\nYour unique ID: {participant_id}\n\nYou will be presented with {len(tasks)} problem-solving tasks in sequence. Please read the instructions for each task carefully.\n\nTry to solve each task efficiently within the time limit.", "Click or Press any Key to Start")

    # Run Tasks
    for task_index, (task_runner_func, task_instructions) in enumerate(tasks):
        # Assign condition based on participant and shuffled task index
        task_condition = (participant_id_numeric + task_index) % NUM_CONDITIONS
        condition_text = "'Without Pre-utilization' (Control)" if task_condition == 0 else "'After Pre-utilization' (Fixedness)"
        # full_instructions = f"{task_instructions}\n\n(Internal Note: Condition for this task is {condition_text})" # Debug condition text
        full_instructions = task_instructions  # Use clean instructions for participant

        show_screen(screen, clock, f"Task {task_index + 1} of {len(tasks)}",
                    full_instructions, "Click or Press any Key to Begin Task")
        task_results = task_runner_func(
            screen, clock, participant_id, task_condition)

        # Log data
        log_entry = {
            "ParticipantID": participant_id, "TaskIndex": task_index + 1, "TaskName": task_results.get("TaskName", "Unknown"),
            "AssignedCondition": task_condition, "StartTime": task_results.get("StartTime"), "EndTime": task_results.get("EndTime"),
            "DurationSeconds": task_results.get("DurationSeconds"), "Outcome": task_results.get("Outcome"),
            "TotalActions": task_results.get("TotalActions"), "IncorrectDrops": task_results.get("IncorrectDrops"),
            "ActionLog": task_results.get("ActionLog")
        }
        # Add all specific flags from the results dict to the log entry
        for key in CSV_FIELDNAMES:
            if key not in log_entry and key in task_results:
                log_entry[key] = task_results[key]
        log_data(log_entry)

        # Transition Screen
        feedback_text = f"Task {task_index + 1} completed.\nOutcome: {task_results.get('Outcome', 'N/A')}"
        button_text = "Click or Press any Key for Next Task" if task_index < len(
            tasks) - 1 else "Click or Press any Key to Finish"
        show_screen(screen, clock, "Task Complete", feedback_text,
                    button_text, title_size=40, text_size=28, button_size=22)

    # Final Screen
    show_screen(screen, clock, "Experiment Finished",
                "You have completed all the tasks.\n\nThank you very much for your time and participation!", "Press any key to exit")
    pygame.quit()
    sys.exit()


if __name__ == "__main__":
    main()
