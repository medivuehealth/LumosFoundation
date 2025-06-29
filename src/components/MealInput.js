import React, { useState } from 'react';
import { Search, Info, X } from 'lucide-react';
import PropTypes from 'prop-types';
import config from '../config';

// Expanded food dictionary with nutritional values
const foodDictionary = {
  // Meals
  'breakfast': { type: 'meal', calories: 0 },
  'brunch': { type: 'meal', calories: 0 },
  'lunch': { type: 'meal', calories: 0 },
  'dinner': { type: 'meal', calories: 0 },
  'snack': { type: 'meal', calories: 0 },
  
  // Breads & Grains
  'bread': { type: 'grain', calories: 80, carbs: 15, protein: 3, fiber: 1 },
  'rice': { type: 'grain', calories: 130, carbs: 28, protein: 2.7, fiber: 0.6 },
  'pasta': { type: 'grain', calories: 200, carbs: 42, protein: 7, fiber: 2.5 },
  'quinoa': { type: 'grain', calories: 120, carbs: 21, protein: 4, fiber: 2.8 },
  'oats': { type: 'grain', calories: 150, carbs: 27, protein: 6, fiber: 4 },
  'cereal': { type: 'grain', calories: 120, carbs: 28, protein: 3, fiber: 2 },
  'barley': { type: 'grain', calories: 123, carbs: 28, protein: 2.3, fiber: 3.8 },
  'tortilla': { type: 'grain', calories: 120, carbs: 23, protein: 3, fiber: 2 },
  'bagel': { type: 'grain', calories: 245, carbs: 48, protein: 10, fiber: 2 },
  'muffin': { type: 'grain', calories: 265, carbs: 38, protein: 4, fiber: 1.5 },
  'pizza': { type: 'grain', calories: 266, carbs: 33, protein: 11, fiber: 2.5 },
  'sandwich': { type: 'grain', calories: 300, carbs: 35, protein: 15, fiber: 3 },
  'burger': { type: 'grain', calories: 354, carbs: 30, protein: 17, fiber: 2 },
  'hamburger': { type: 'grain', calories: 354, carbs: 30, protein: 17, fiber: 2 },
  'hotdog': { type: 'grain', calories: 151, carbs: 18, protein: 5, fiber: 0.8 },
  'taco': { type: 'grain', calories: 226, carbs: 20, protein: 9, fiber: 3 },
  'burrito': { type: 'grain', calories: 206, carbs: 27, protein: 8, fiber: 3 },
  'wrap': { type: 'grain', calories: 180, carbs: 25, protein: 6, fiber: 2 },
  'pancake': { type: 'grain', calories: 227, carbs: 28, protein: 6, fiber: 1 },
  'waffle': { type: 'grain', calories: 218, carbs: 25, protein: 6, fiber: 1 },
  'toast': { type: 'grain', calories: 75, carbs: 14, protein: 3, fiber: 1 },
  'croissant': { type: 'grain', calories: 231, carbs: 26, protein: 5, fiber: 1 },
  'donut': { type: 'grain', calories: 253, carbs: 31, protein: 4, fiber: 1 },
  'cookie': { type: 'grain', calories: 502, carbs: 63, protein: 6, fiber: 2 },
  'cake': { type: 'grain', calories: 257, carbs: 38, protein: 3, fiber: 1 },
  'brownie': { type: 'grain', calories: 466, carbs: 64, protein: 5, fiber: 2 },
  
  // Proteins
  'chicken': { type: 'protein', calories: 165, protein: 31, carbs: 0, fiber: 0 },
  'beef': { type: 'protein', calories: 250, protein: 26, carbs: 0, fiber: 0 },
  'fish': { type: 'protein', calories: 206, protein: 22, carbs: 0, fiber: 0 },
  'eggs': { type: 'protein', calories: 70, protein: 6, carbs: 0, fiber: 0 },
  'tofu': { type: 'protein', calories: 94, protein: 10, carbs: 2, fiber: 0.5 },
  'tempeh': { type: 'protein', calories: 195, protein: 20, carbs: 8, fiber: 0 },
  'salmon': { type: 'protein', calories: 208, protein: 22, carbs: 0, fiber: 0 },
  'tuna': { type: 'protein', calories: 179, protein: 39, carbs: 0, fiber: 0 },
  'pork': { type: 'protein', calories: 242, protein: 26, carbs: 0, fiber: 0 },
  'turkey': { type: 'protein', calories: 135, protein: 25, carbs: 0, fiber: 0 },
  'beans': { type: 'protein', calories: 132, protein: 9, carbs: 24, fiber: 9 },
  'lentils': { type: 'protein', calories: 230, protein: 18, carbs: 40, fiber: 16 },
  'bacon': { type: 'protein', calories: 541, protein: 37, carbs: 1, fiber: 0 },
  'sausage': { type: 'protein', calories: 296, protein: 12, carbs: 2, fiber: 0 },
  'ham': { type: 'protein', calories: 145, protein: 21, carbs: 0, fiber: 0 },
  'shrimp': { type: 'protein', calories: 99, protein: 24, carbs: 0, fiber: 0 },
  'crab': { type: 'protein', calories: 97, protein: 20, carbs: 0, fiber: 0 },
  'lobster': { type: 'protein', calories: 89, protein: 19, carbs: 0, fiber: 0 },
  'peanut': { type: 'protein', calories: 567, protein: 26, carbs: 16, fiber: 9 },
  'almond': { type: 'protein', calories: 579, protein: 21, carbs: 22, fiber: 12 },
  'walnut': { type: 'protein', calories: 654, protein: 15, carbs: 14, fiber: 7 },
  'cashew': { type: 'protein', calories: 553, protein: 18, carbs: 30, fiber: 3 },
  'peanutbutter': { type: 'protein', calories: 588, protein: 25, carbs: 20, fiber: 6 },
  'peanut_butter': { type: 'protein', calories: 588, protein: 25, carbs: 20, fiber: 6 },
  
  // Dairy
  'milk': { type: 'dairy', calories: 103, protein: 8, carbs: 12, fiber: 0 },
  'cheese': { type: 'dairy', calories: 113, protein: 7, carbs: 1, fiber: 0 },
  'yogurt': { type: 'dairy', calories: 150, protein: 12, carbs: 17, fiber: 0 },
  'butter': { type: 'dairy', calories: 102, protein: 0, carbs: 0, fiber: 0 },
  'cream': { type: 'dairy', calories: 120, protein: 0, carbs: 0, fiber: 0 },
  'icecream': { type: 'dairy', calories: 207, protein: 4, carbs: 24, fiber: 0 },
  'ice_cream': { type: 'dairy', calories: 207, protein: 4, carbs: 24, fiber: 0 },
  'cottage_cheese': { type: 'dairy', calories: 98, protein: 11, carbs: 3, fiber: 0 },
  'sour_cream': { type: 'dairy', calories: 198, protein: 2, carbs: 4, fiber: 0 },
  'whipped_cream': { type: 'dairy', calories: 257, protein: 2, carbs: 8, fiber: 0 },
  
  // Vegetables
  'lettuce': { type: 'vegetable', calories: 5, carbs: 1, protein: 0.5, fiber: 0.5 },
  'tomato': { type: 'vegetable', calories: 22, carbs: 4.8, protein: 1.1, fiber: 1.5 },
  'carrot': { type: 'vegetable', calories: 41, carbs: 9.6, protein: 0.9, fiber: 2.8 },
  'potato': { type: 'vegetable', calories: 163, carbs: 37, protein: 4.3, fiber: 3.8 },
  'onion': { type: 'vegetable', calories: 44, carbs: 10, protein: 1.2, fiber: 1.7 },
  'garlic': { type: 'vegetable', calories: 4, carbs: 1, protein: 0.2, fiber: 0.1 },
  'broccoli': { type: 'vegetable', calories: 55, carbs: 11, protein: 3.7, fiber: 5.2 },
  'spinach': { type: 'vegetable', calories: 23, carbs: 3.6, protein: 2.9, fiber: 2.2 },
  'cucumber': { type: 'vegetable', calories: 8, carbs: 1.9, protein: 0.3, fiber: 0.5 },
  'pepper': { type: 'vegetable', calories: 30, carbs: 7, protein: 1, fiber: 2.1 },
  'cauliflower': { type: 'vegetable', calories: 25, carbs: 5, protein: 2, fiber: 2.5 },
  'asparagus': { type: 'vegetable', calories: 20, carbs: 3.9, protein: 2.2, fiber: 2 },
  'zucchini': { type: 'vegetable', calories: 17, carbs: 3.1, protein: 1.2, fiber: 1 },
  'mushroom': { type: 'vegetable', calories: 22, carbs: 3.3, protein: 3.1, fiber: 1 },
  'corn': { type: 'vegetable', calories: 86, carbs: 19, protein: 3, fiber: 2.7 },
  'peas': { type: 'vegetable', calories: 84, carbs: 14, protein: 5, fiber: 5 },
  'greenbeans': { type: 'vegetable', calories: 31, carbs: 7, protein: 2, fiber: 3 },
  'green_beans': { type: 'vegetable', calories: 31, carbs: 7, protein: 2, fiber: 3 },
  'celery': { type: 'vegetable', calories: 6, carbs: 1, protein: 0.3, fiber: 0.6 },
  'radish': { type: 'vegetable', calories: 16, carbs: 3, protein: 0.7, fiber: 1.6 },
  'beet': { type: 'vegetable', calories: 43, carbs: 10, protein: 1.6, fiber: 2.8 },
  'squash': { type: 'vegetable', calories: 31, carbs: 7, protein: 1, fiber: 2.5 },
  'eggplant': { type: 'vegetable', calories: 25, carbs: 6, protein: 1, fiber: 3 },
  'artichoke': { type: 'vegetable', calories: 47, carbs: 11, protein: 3, fiber: 5 },
  'brussels_sprouts': { type: 'vegetable', calories: 43, carbs: 9, protein: 3, fiber: 3.8 },
  'kale': { type: 'vegetable', calories: 49, carbs: 9, protein: 4, fiber: 3.6 },
  'cabbage': { type: 'vegetable', calories: 25, carbs: 6, protein: 1, fiber: 2.5 },
  'salad': { type: 'vegetable', calories: 20, carbs: 4, protein: 1, fiber: 1.5 },
  
  // Fruits
  'apple': { type: 'fruit', calories: 95, carbs: 25, protein: 0.5, fiber: 4.5 },
  'banana': { type: 'fruit', calories: 105, carbs: 27, protein: 1.3, fiber: 3.1 },
  'orange': { type: 'fruit', calories: 62, carbs: 15, protein: 1.2, fiber: 3.1 },
  'grape': { type: 'fruit', calories: 69, carbs: 18, protein: 0.7, fiber: 0.9 },
  'strawberry': { type: 'fruit', calories: 32, carbs: 7.7, protein: 0.7, fiber: 2 },
  'blueberry': { type: 'fruit', calories: 57, carbs: 14, protein: 0.7, fiber: 2.4 },
  'mango': { type: 'fruit', calories: 99, carbs: 24.7, protein: 1.4, fiber: 2.6 },
  'pineapple': { type: 'fruit', calories: 82, carbs: 21.6, protein: 0.9, fiber: 2.3 },
  'avocado': { type: 'fruit', calories: 160, carbs: 8.5, protein: 2, fiber: 6.7 },
  'pear': { type: 'fruit', calories: 101, carbs: 27, protein: 0.6, fiber: 5.5 },
  'peach': { type: 'fruit', calories: 59, carbs: 14, protein: 1.4, fiber: 2.3 },
  'kiwi': { type: 'fruit', calories: 61, carbs: 14.7, protein: 1.1, fiber: 3 },
  'watermelon': { type: 'fruit', calories: 30, carbs: 8, protein: 0.6, fiber: 0.4 },
  'cantaloupe': { type: 'fruit', calories: 34, carbs: 8, protein: 0.8, fiber: 0.9 },
  'honeydew': { type: 'fruit', calories: 36, carbs: 9, protein: 0.5, fiber: 0.8 },
  'plum': { type: 'fruit', calories: 46, carbs: 11, protein: 0.7, fiber: 1.4 },
  'apricot': { type: 'fruit', calories: 48, carbs: 11, protein: 1.4, fiber: 2 },
  'cherry': { type: 'fruit', calories: 50, carbs: 12, protein: 1, fiber: 1.6 },
  'raspberry': { type: 'fruit', calories: 52, carbs: 12, protein: 1.2, fiber: 6.5 },
  'blackberry': { type: 'fruit', calories: 43, carbs: 10, protein: 1.4, fiber: 5.3 },
  'lemon': { type: 'fruit', calories: 17, carbs: 5, protein: 0.6, fiber: 1.6 },
  'lime': { type: 'fruit', calories: 20, carbs: 7, protein: 0.5, fiber: 1.9 },
  'grapefruit': { type: 'fruit', calories: 42, carbs: 11, protein: 0.8, fiber: 1.6 },
  'pomegranate': { type: 'fruit', calories: 83, carbs: 19, protein: 1.7, fiber: 4 },
  'fig': { type: 'fruit', calories: 74, carbs: 19, protein: 0.8, fiber: 2.9 },
  'date': { type: 'fruit', calories: 282, carbs: 75, protein: 2.5, fiber: 8 },
  'raisin': { type: 'fruit', calories: 299, carbs: 79, protein: 3.1, fiber: 3.7 },
  'prune': { type: 'fruit', calories: 240, carbs: 64, protein: 2.2, fiber: 7.1 },
  
  // Soups & Stews
  'soup': { type: 'soup', calories: 100, carbs: 15, protein: 5, fiber: 2 },
  'stew': { type: 'soup', calories: 150, carbs: 20, protein: 8, fiber: 3 },
  'chili': { type: 'soup', calories: 200, carbs: 25, protein: 12, fiber: 5 },
  'chowder': { type: 'soup', calories: 180, carbs: 18, protein: 10, fiber: 2 },
  'broth': { type: 'soup', calories: 15, carbs: 1, protein: 2, fiber: 0 },
  'stock': { type: 'soup', calories: 15, carbs: 1, protein: 2, fiber: 0 },
  
  // Beverages
  'coffee': { type: 'beverage', calories: 2, carbs: 0, protein: 0, fiber: 0 },
  'tea': { type: 'beverage', calories: 1, carbs: 0, protein: 0, fiber: 0 },
  'juice': { type: 'beverage', calories: 120, carbs: 30, protein: 0, fiber: 0 },
  'soda': { type: 'beverage', calories: 150, carbs: 39, protein: 0, fiber: 0 },
  'pop': { type: 'beverage', calories: 150, carbs: 39, protein: 0, fiber: 0 },
  'water': { type: 'beverage', calories: 0, carbs: 0, protein: 0, fiber: 0 },
  'smoothie': { type: 'beverage', calories: 200, carbs: 40, protein: 5, fiber: 3 },
  'milkshake': { type: 'beverage', calories: 300, carbs: 45, protein: 8, fiber: 0 },
  
  // Snacks & Processed Foods
  'chips': { type: 'snack', calories: 536, carbs: 53, protein: 7, fiber: 4 },
  'popcorn': { type: 'snack', calories: 375, carbs: 74, protein: 11, fiber: 15 },
  'pretzel': { type: 'snack', calories: 380, carbs: 80, protein: 10, fiber: 3 },
  'crackers': { type: 'snack', calories: 502, carbs: 61, protein: 7, fiber: 2 },
  'nuts': { type: 'snack', calories: 607, protein: 20, carbs: 23, fiber: 11 },
  'seeds': { type: 'snack', calories: 584, protein: 21, carbs: 28, fiber: 12 },
  'granola': { type: 'snack', calories: 471, carbs: 64, protein: 10, fiber: 8 },
  'energy_bar': { type: 'snack', calories: 200, carbs: 25, protein: 10, fiber: 3 },
  'protein_bar': { type: 'snack', calories: 200, carbs: 20, protein: 15, fiber: 3 },
  'candy': { type: 'snack', calories: 400, carbs: 90, protein: 0, fiber: 0 },
  'chocolate': { type: 'snack', calories: 545, carbs: 61, protein: 4, fiber: 3 },
  'gum': { type: 'snack', calories: 0, carbs: 0, protein: 0, fiber: 0 },
  
  // Condiments & Sauces
  'ketchup': { type: 'condiment', calories: 102, carbs: 27, protein: 0, fiber: 0 },
  'mustard': { type: 'condiment', calories: 66, carbs: 5, protein: 4, fiber: 4 },
  'mayo': { type: 'condiment', calories: 680, carbs: 0, protein: 1, fiber: 0 },
  'mayonnaise': { type: 'condiment', calories: 680, carbs: 0, protein: 1, fiber: 0 },
  'salsa': { type: 'condiment', calories: 36, carbs: 7, protein: 2, fiber: 2 },
  'guacamole': { type: 'condiment', calories: 160, carbs: 9, protein: 2, fiber: 7 },
  'hummus': { type: 'condiment', calories: 166, carbs: 20, protein: 8, fiber: 6 },
  'dressing': { type: 'condiment', calories: 200, carbs: 8, protein: 1, fiber: 0 },
  'sauce': { type: 'condiment', calories: 100, carbs: 20, protein: 2, fiber: 1 },
  'gravy': { type: 'condiment', calories: 50, carbs: 8, protein: 2, fiber: 0 },
  
  // Italian Cuisine
  'spaghetti': { type: 'grain', calories: 200, carbs: 42, protein: 7, fiber: 2.5 },
  'lasagna': { type: 'grain', calories: 300, carbs: 35, protein: 15, fiber: 3 },
  'ravioli': { type: 'grain', calories: 250, carbs: 40, protein: 12, fiber: 2 },
  'fettuccine': { type: 'grain', calories: 200, carbs: 42, protein: 7, fiber: 2.5 },
  'penne': { type: 'grain', calories: 200, carbs: 42, protein: 7, fiber: 2.5 },
  'risotto': { type: 'grain', calories: 180, carbs: 35, protein: 5, fiber: 1 },
  'bruschetta': { type: 'grain', calories: 150, carbs: 25, protein: 4, fiber: 2 },
  'calzone': { type: 'grain', calories: 400, carbs: 45, protein: 18, fiber: 3 },
  'cannoli': { type: 'grain', calories: 300, carbs: 35, protein: 6, fiber: 1 },
  'tiramisu': { type: 'grain', calories: 350, carbs: 40, protein: 8, fiber: 1 },
  'gnocchi': { type: 'grain', calories: 180, carbs: 35, protein: 5, fiber: 2 },
  'prosciutto': { type: 'protein', calories: 200, protein: 25, carbs: 0, fiber: 0 },
  'parmesan': { type: 'dairy', calories: 431, protein: 38, carbs: 4, fiber: 0 },
  'mozzarella': { type: 'dairy', calories: 280, protein: 28, carbs: 2, fiber: 0 },
  'ricotta': { type: 'dairy', calories: 174, protein: 11, carbs: 3, fiber: 0 },
  'pesto': { type: 'condiment', calories: 300, carbs: 8, protein: 8, fiber: 4 },
  'marinara': { type: 'condiment', calories: 80, carbs: 15, protein: 3, fiber: 3 },
  'alfredo': { type: 'condiment', calories: 200, carbs: 5, protein: 3, fiber: 0 },
  
  // Mexican Cuisine
  'enchilada': { type: 'grain', calories: 250, carbs: 25, protein: 12, fiber: 3 },
  'quesadilla': { type: 'grain', calories: 300, carbs: 30, protein: 15, fiber: 2 },
  'fajita': { type: 'grain', calories: 280, carbs: 28, protein: 18, fiber: 4 },
  'tamale': { type: 'grain', calories: 220, carbs: 35, protein: 8, fiber: 3 },
  'churro': { type: 'grain', calories: 300, carbs: 45, protein: 4, fiber: 1 },
  'flan': { type: 'dairy', calories: 250, carbs: 35, protein: 6, fiber: 0 },
  'pico_de_gallo': { type: 'condiment', calories: 30, carbs: 6, protein: 1, fiber: 2 },
  'refried_beans': { type: 'protein', calories: 120, protein: 7, carbs: 20, fiber: 6 },
  'chorizo': { type: 'protein', calories: 455, protein: 24, carbs: 1, fiber: 0 },
  'carnitas': { type: 'protein', calories: 300, protein: 25, carbs: 0, fiber: 0 },
  'al_pastor': { type: 'protein', calories: 280, protein: 22, carbs: 5, fiber: 1 },
  
  // Chinese Cuisine
  'fried_rice': { type: 'grain', calories: 250, carbs: 45, protein: 8, fiber: 2 },
  'lo_mein': { type: 'grain', calories: 280, carbs: 50, protein: 10, fiber: 3 },
  'chow_mein': { type: 'grain', calories: 260, carbs: 48, protein: 9, fiber: 2 },
  'dumpling': { type: 'grain', calories: 200, carbs: 35, protein: 8, fiber: 2 },
  'wonton': { type: 'grain', calories: 180, carbs: 30, protein: 7, fiber: 1 },
  'spring_roll': { type: 'grain', calories: 150, carbs: 25, protein: 5, fiber: 2 },
  'egg_roll': { type: 'grain', calories: 200, carbs: 28, protein: 6, fiber: 2 },
  'kung_pao': { type: 'protein', calories: 280, protein: 25, carbs: 15, fiber: 4 },
  'sweet_sour': { type: 'protein', calories: 250, protein: 20, carbs: 20, fiber: 3 },
  'general_tsos': { type: 'protein', calories: 300, protein: 22, carbs: 25, fiber: 2 },
  'orange_chicken': { type: 'protein', calories: 280, protein: 20, carbs: 22, fiber: 2 },
  'beef_broccoli': { type: 'protein', calories: 220, protein: 25, carbs: 12, fiber: 4 },
  'mapo_tofu': { type: 'protein', calories: 180, protein: 15, carbs: 8, fiber: 3 },
  'kung_pao_chicken': { type: 'protein', calories: 280, protein: 25, carbs: 15, fiber: 4 },
  'moo_shu': { type: 'grain', calories: 200, carbs: 30, protein: 12, fiber: 3 },
  'peking_duck': { type: 'protein', calories: 350, protein: 30, carbs: 5, fiber: 1 },
  'dim_sum': { type: 'grain', calories: 150, carbs: 25, protein: 6, fiber: 2 },
  'fortune_cookie': { type: 'grain', calories: 30, carbs: 6, protein: 0, fiber: 0 },
  
  // Indian Cuisine
  'curry': { type: 'protein', calories: 200, protein: 15, carbs: 20, fiber: 5 },
  'biryani': { type: 'grain', calories: 350, carbs: 55, protein: 12, fiber: 4 },
  'naan': { type: 'grain', calories: 250, carbs: 45, protein: 8, fiber: 2 },
  'roti': { type: 'grain', calories: 120, carbs: 22, protein: 3, fiber: 2 },
  'chapati': { type: 'grain', calories: 100, carbs: 20, protein: 3, fiber: 2 },
  'samosa': { type: 'grain', calories: 250, carbs: 35, protein: 6, fiber: 3 },
  'pakora': { type: 'grain', calories: 200, carbs: 25, protein: 8, fiber: 3 },
  'dal': { type: 'protein', calories: 120, protein: 8, carbs: 20, fiber: 8 },
  'tandoori': { type: 'protein', calories: 250, protein: 30, carbs: 5, fiber: 2 },
  'butter_chicken': { type: 'protein', calories: 350, protein: 25, carbs: 15, fiber: 3 },
  'chicken_tikka': { type: 'protein', calories: 280, protein: 28, carbs: 8, fiber: 2 },
  'palak_paneer': { type: 'protein', calories: 200, protein: 12, carbs: 10, fiber: 4 },
  'aloo_gobi': { type: 'vegetable', calories: 150, carbs: 25, protein: 5, fiber: 6 },
  'gulab_jamun': { type: 'grain', calories: 300, carbs: 45, protein: 4, fiber: 1 },
  'kheer': { type: 'dairy', calories: 250, carbs: 35, protein: 6, fiber: 1 },
  'lassi': { type: 'beverage', calories: 150, carbs: 25, protein: 5, fiber: 1 },
  'chai': { type: 'beverage', calories: 50, carbs: 10, protein: 1, fiber: 0 },
  
  // Japanese Cuisine
  'sushi': { type: 'grain', calories: 200, carbs: 35, protein: 8, fiber: 1 },
  'sashimi': { type: 'protein', calories: 120, protein: 20, carbs: 0, fiber: 0 },
  'tempura': { type: 'grain', calories: 250, carbs: 30, protein: 8, fiber: 2 },
  'teriyaki': { type: 'protein', calories: 220, protein: 25, carbs: 15, fiber: 2 },
  'ramen': { type: 'grain', calories: 300, carbs: 50, protein: 12, fiber: 3 },
  'udon': { type: 'grain', calories: 250, carbs: 45, protein: 8, fiber: 2 },
  'soba': { type: 'grain', calories: 200, carbs: 40, protein: 6, fiber: 3 },
  'miso_soup': { type: 'soup', calories: 50, carbs: 8, protein: 3, fiber: 1 },
  'gyoza': { type: 'grain', calories: 180, carbs: 28, protein: 7, fiber: 2 },
  'takoyaki': { type: 'grain', calories: 200, carbs: 25, protein: 8, fiber: 1 },
  'okonomiyaki': { type: 'grain', calories: 250, carbs: 30, protein: 10, fiber: 3 },
  'tonkatsu': { type: 'protein', calories: 350, protein: 25, carbs: 20, fiber: 2 },
  'yakitori': { type: 'protein', calories: 150, protein: 18, carbs: 5, fiber: 1 },
  'bento': { type: 'meal', calories: 400, carbs: 50, protein: 20, fiber: 5 },
  'mochi': { type: 'grain', calories: 100, carbs: 20, protein: 1, fiber: 0 },
  'matcha': { type: 'beverage', calories: 5, carbs: 1, protein: 0, fiber: 0 },
  
  // Thai Cuisine
  'pad_thai': { type: 'grain', calories: 300, carbs: 45, protein: 12, fiber: 3 },
  'green_curry': { type: 'protein', calories: 250, protein: 18, carbs: 20, fiber: 4 },
  'red_curry': { type: 'protein', calories: 250, protein: 18, carbs: 20, fiber: 4 },
  'yellow_curry': { type: 'protein', calories: 250, protein: 18, carbs: 20, fiber: 4 },
  'tom_yum': { type: 'soup', calories: 120, carbs: 15, protein: 8, fiber: 2 },
  'tom_kha': { type: 'soup', calories: 180, carbs: 12, protein: 6, fiber: 2 },
  'som_tam': { type: 'vegetable', calories: 80, carbs: 15, protein: 3, fiber: 4 },
  'larb': { type: 'protein', calories: 200, protein: 25, carbs: 8, fiber: 3 },
  'satay': { type: 'protein', calories: 180, protein: 20, carbs: 5, fiber: 1 },
  'mango_sticky_rice': { type: 'grain', calories: 300, carbs: 55, protein: 4, fiber: 2 },
  'thai_tea': { type: 'beverage', calories: 120, carbs: 25, protein: 1, fiber: 0 },
  
  // Mediterranean Cuisine
  'falafel': { type: 'protein', calories: 200, protein: 12, carbs: 25, fiber: 6 },
  'shawarma': { type: 'protein', calories: 280, protein: 25, carbs: 20, fiber: 3 },
  'kebab': { type: 'protein', calories: 250, protein: 22, carbs: 15, fiber: 2 },
  'gyro': { type: 'protein', calories: 300, protein: 20, carbs: 25, fiber: 2 },
  'tabbouleh': { type: 'grain', calories: 120, carbs: 20, protein: 4, fiber: 4 },
  'baba_ganoush': { type: 'condiment', calories: 150, carbs: 12, protein: 3, fiber: 4 },
  'tzatziki': { type: 'condiment', calories: 80, carbs: 5, protein: 4, fiber: 1 },
  'moussaka': { type: 'protein', calories: 350, protein: 20, carbs: 25, fiber: 4 },
  'dolmades': { type: 'grain', calories: 120, carbs: 18, protein: 4, fiber: 3 },
  'baklava': { type: 'grain', calories: 400, carbs: 50, protein: 6, fiber: 2 },
  'feta': { type: 'dairy', calories: 264, protein: 14, carbs: 4, fiber: 0 },
  'olive': { type: 'vegetable', calories: 115, carbs: 6, protein: 1, fiber: 3 },
  'pita': { type: 'grain', calories: 165, carbs: 33, protein: 6, fiber: 1 },
  
  // Korean Cuisine
  'bibimbap': { type: 'grain', calories: 350, carbs: 45, protein: 15, fiber: 6 },
  'bulgogi': { type: 'protein', calories: 280, protein: 25, carbs: 15, fiber: 2 },
  'galbi': { type: 'protein', calories: 320, protein: 28, carbs: 8, fiber: 1 },
  'japchae': { type: 'grain', calories: 250, carbs: 40, protein: 8, fiber: 3 },
  'tteokbokki': { type: 'grain', calories: 200, carbs: 35, protein: 5, fiber: 2 },
  'kimchi': { type: 'vegetable', calories: 23, carbs: 4, protein: 2, fiber: 2 },
  'kimbap': { type: 'grain', calories: 180, carbs: 30, protein: 6, fiber: 2 },
  'samgyeopsal': { type: 'protein', calories: 350, protein: 20, carbs: 0, fiber: 0 },
  'soondubu': { type: 'soup', calories: 150, carbs: 12, protein: 10, fiber: 3 },
  'banchan': { type: 'vegetable', calories: 50, carbs: 8, protein: 2, fiber: 2 },
  
  // Vietnamese Cuisine
  'pho': { type: 'soup', calories: 200, carbs: 30, protein: 15, fiber: 3 },
  'banh_mi': { type: 'grain', calories: 250, carbs: 35, protein: 12, fiber: 3 },
  'spring_rolls': { type: 'grain', calories: 120, carbs: 20, protein: 5, fiber: 2 },
  'bun_bo_hue': { type: 'soup', calories: 250, carbs: 35, protein: 18, fiber: 4 },
  'com_tam': { type: 'grain', calories: 300, carbs: 45, protein: 15, fiber: 3 },
  'cao_lau': { type: 'grain', calories: 280, carbs: 40, protein: 12, fiber: 3 },
  'banh_xeo': { type: 'grain', calories: 200, carbs: 25, protein: 8, fiber: 2 },
  'che': { type: 'beverage', calories: 150, carbs: 30, protein: 2, fiber: 1 },
  
  // Middle Eastern Cuisine
  'couscous': { type: 'grain', calories: 176, carbs: 36, protein: 6, fiber: 2 },
  'lentil_soup': { type: 'soup', calories: 120, carbs: 20, protein: 8, fiber: 6 },
  'mujadara': { type: 'grain', calories: 250, carbs: 40, protein: 10, fiber: 6 },
  'fattoush': { type: 'vegetable', calories: 80, carbs: 12, protein: 3, fiber: 4 },
  'manakeesh': { type: 'grain', calories: 200, carbs: 30, protein: 8, fiber: 2 },
  'knafeh': { type: 'grain', calories: 350, carbs: 45, protein: 6, fiber: 1 },
  
  // French Cuisine
  'quiche': { type: 'grain', calories: 300, carbs: 25, protein: 15, fiber: 2 },
  'ratatouille': { type: 'vegetable', calories: 120, carbs: 15, protein: 4, fiber: 6 },
  'coq_au_vin': { type: 'protein', calories: 280, protein: 25, carbs: 8, fiber: 2 },
  'beef_bourguignon': { type: 'protein', calories: 320, protein: 28, carbs: 12, fiber: 3 },
  'creme_brulee': { type: 'dairy', calories: 300, carbs: 25, protein: 5, fiber: 0 },
  'macaron': { type: 'grain', calories: 100, carbs: 15, protein: 2, fiber: 0 },
  'eclair': { type: 'grain', calories: 250, carbs: 30, protein: 4, fiber: 1 },
  
  // German Cuisine
  'bratwurst': { type: 'protein', calories: 280, protein: 15, carbs: 5, fiber: 1 },
  'sauerkraut': { type: 'vegetable', calories: 20, carbs: 4, protein: 1, fiber: 3 },
  'schnitzel': { type: 'protein', calories: 350, protein: 25, carbs: 20, fiber: 2 },
  'spaetzle': { type: 'grain', calories: 200, carbs: 35, protein: 6, fiber: 2 },
  'strudel': { type: 'grain', calories: 300, carbs: 40, protein: 5, fiber: 2 },
  
  // Greek Cuisine
  'souvlaki': { type: 'protein', calories: 250, protein: 22, carbs: 15, fiber: 2 },
  'spanakopita': { type: 'grain', calories: 200, carbs: 25, protein: 8, fiber: 3 },
  'pastitsio': { type: 'grain', calories: 300, carbs: 30, protein: 15, fiber: 3 },
  
  // Common misspellings and variations
  'brekfast': { alias: 'breakfast' },
  'brekfest': { alias: 'breakfast' },
  'lunsh': { alias: 'lunch' },
  'dinnar': { alias: 'dinner' },
  'diner': { alias: 'dinner' },
  'chiken': { alias: 'chicken' },
  'checken': { alias: 'chicken' },
  'tomatoe': { alias: 'tomato' },
  'potatos': { alias: 'potato' },
  'potatoe': { alias: 'potato' },
  'brocoli': { alias: 'broccoli' },
  'broccolli': { alias: 'broccoli' },
  'spinage': { alias: 'spinach' },
  'spinich': { alias: 'spinach' },
  'cucumbar': { alias: 'cucumber' },
  'bannana': { alias: 'banana' },
  'straberry': { alias: 'strawberry' },
  'mangoe': { alias: 'mango' },
  'bluberry': { alias: 'blueberry' },
  'yoghurt': { alias: 'yogurt' },
  'yougurt': { alias: 'yogurt' },
  'egs': { alias: 'eggs' },
  'egss': { alias: 'eggs' },
  'piza': { alias: 'pizza' }
};

// Levenshtein distance for word similarity
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Find closest matching food word
function findClosestFoodWord(word) {
  if (!word) return { word: '', nutritionInfo: null };
  word = word.toLowerCase().trim();
  
  // Direct match
  if (foodDictionary[word] && !foodDictionary[word].alias) {
    return { word, nutritionInfo: foodDictionary[word] };
  }
  
  // Known misspelling
  if (foodDictionary[word]?.alias) {
    const correctWord = foodDictionary[word].alias;
    return { word: correctWord, nutritionInfo: foodDictionary[correctWord] };
  }
  
  // Find closest match using Levenshtein distance
  let closestWord = word;
  let minDistance = Infinity;
  let nutritionInfo = null;
  
  Object.entries(foodDictionary).forEach(([dictWord, info]) => {
    if (!info.alias) { // Only match against real food words, not aliases
      const distance = levenshteinDistance(word, dictWord);
      if (distance < minDistance && distance <= 2) { // Max 2 character differences
        minDistance = distance;
        closestWord = dictWord;
        nutritionInfo = info;
      }
    }
  });
  
  return { word: closestWord, nutritionInfo };
}

// Calculate total nutrition for a meal
function calculateMealNutrition(text) {
  const words = text.split(/\s+/);
  const nutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fiber: 0
  };
  
  words.forEach(word => {
    const { nutritionInfo } = findClosestFoodWord(word);
    if (nutritionInfo && nutritionInfo.type !== 'meal') {
      nutrition.calories += nutritionInfo.calories || 0;
      nutrition.protein += nutritionInfo.protein || 0;
      nutrition.carbs += nutritionInfo.carbs || 0;
      nutrition.fiber += nutritionInfo.fiber || 0;
    }
  });
  
  return nutrition;
}

function MealInput({ type, userId, onSave }) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [nutrition, setNutrition] = useState(null);
  const [showNutrition, setShowNutrition] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveMealLog = async (mealData) => {
    try {
      const response = await fetch(`${config.API_URL}/api/meal_logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          meal_type: type,
          food_items: mealData.food_items,
          portion_sizes: mealData.portion_sizes || '',
          notes: mealData.notes || ''
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error saving meal log:', error);
      throw error;
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Process each word for suggestions
    const words = newValue.split(/\s+/);
    const newSuggestions = words
      .map(word => {
        const { word: suggestion, nutritionInfo } = findClosestFoodWord(word);
        return suggestion !== word ? { original: word, suggestion, nutritionInfo } : null;
      })
      .filter(Boolean);
    
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0);
    
    // Calculate nutrition
    const mealNutrition = calculateMealNutrition(newValue);
    setNutrition(mealNutrition);
  };

  const handleBlur = async () => {
    if (!inputValue.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
    
      // Save meal log
      const savedMeal = await saveMealLog({
        food_items: inputValue
      });
    
      // Calculate nutrition for this meal
      const mealNutrition = calculateMealNutrition(inputValue);
      
      // Notify parent component with both meal data and nutrition
      if (typeof onSave === 'function') {
        onSave({
          ...savedMeal,
          nutrition: mealNutrition
        });
      }
    } catch (err) {
      setError(err.message);
      console.error('Error saving meal log:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestion = (suggestion) => {
    const words = inputValue.split(/\s+/);
    const newWords = words.map(word => 
      word.toLowerCase() === suggestion.original.toLowerCase() ? suggestion.suggestion : word
    );
    const newText = newWords.join(' ');
    setInputValue(newText);
    onSave(newText);
    setShowSuggestions(false);
  };

  return (
    <div className="relative mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="block text-sm font-medium text-gray-700">
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </label>
        {nutrition && (
          <button
            type="button"
            onClick={() => setShowNutrition(!showNutrition)}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            <Info className="w-4 h-4 mr-1" />
            Nutrition Info
          </button>
        )}
      </div>
      
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={`What did you have for ${type}?`}
          className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            isLoading ? 'bg-gray-50' : ''
          }`}
          disabled={isLoading}
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
            <div className="p-2">
              <div className="flex items-center justify-between border-b pb-2 mb-2">
                <div className="flex items-center text-sm text-gray-700">
                  <Search className="w-4 h-4 mr-2 text-gray-400" />
                  <span>Suggestions</span>
                </div>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => applySuggestion(suggestion)}
                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer rounded-md flex items-center justify-between"
                >
                  <div>
                    <span className="text-red-500 line-through mr-2">{suggestion.original}</span>
                    <span className="text-green-600">{suggestion.suggestion}</span>
                  </div>
                  {suggestion.nutritionInfo && (
                    <span className="text-xs text-gray-500">
                      {suggestion.nutritionInfo.calories} cal
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-1 text-xs text-red-500">
          Error: {error}
        </div>
      )}
      
      {showNutrition && nutrition && (
        <div className="mt-2 p-3 bg-blue-50 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Estimated Nutrition</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Calories:</span>
              <span className="ml-2 font-medium">{Math.round(nutrition.calories)}</span>
            </div>
            <div>
              <span className="text-gray-600">Protein:</span>
              <span className="ml-2 font-medium">{Math.round(nutrition.protein)}g</span>
            </div>
            <div>
              <span className="text-gray-600">Carbs:</span>
              <span className="ml-2 font-medium">{Math.round(nutrition.carbs)}g</span>
            </div>
            <div>
              <span className="text-gray-600">Fiber:</span>
              <span className="ml-2 font-medium">{Math.round(nutrition.fiber)}g</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

MealInput.propTypes = {
  type: PropTypes.oneOf(['breakfast', 'lunch', 'dinner', 'snack']).isRequired,
  userId: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired
};

export default MealInput; 