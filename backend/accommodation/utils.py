import math


def findpoints(lon, lat, radius=1.5):
    """
    take a logitude and latitude as arguments
    return 
    the max longitude, latitude pair
    the min longitude, latitude pair
    in 1km square range
    """
    max_pair = [-200.0, -200.0]
    min_pair = [200.0, 200.0]
    for k in range(0, 360, 2):
        angle = math.pi*2*k/360
        dx = radius*math.cos(angle)
        dy = radius*math.sin(angle)

        temp_lat = lat + (180/math.pi)*(dy/6371)  # Earth Radius
        temp_lon = lon + (180/math.pi)*(dx/6371) / \
            math.cos(lon*math.pi/180)  # Earth Radius
        if temp_lat > max_pair[1]:
            max_pair[1] = temp_lat
        elif temp_lat < min_pair[1]:
            min_pair[1] = temp_lat
        if temp_lon > max_pair[0]:
            max_pair[0] = temp_lon
        elif temp_lon < min_pair[0]:
            min_pair[0] = temp_lon

    return max_pair, min_pair
