# -*- coding: utf-8 -*-
"""Mô-đun lõi của plugin ComfyUI Thư viện tham chiếu 3-trong-1 nhân vật AI."""

from .nodes import NODE_CLASS_MAPPINGS, NODE_DISPLAY_NAME_MAPPINGS
from .routes import register_routes

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "register_routes"]
