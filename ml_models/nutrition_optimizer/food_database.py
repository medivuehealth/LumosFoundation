FOOD_DATABASE = {
    'breakfast': {
        'high_protein': [
            {
                'name': 'Greek yogurt with berries and nuts',
                'nutrition': {
                    'calories': 300,
                    'protein': 20,
                    'carbs': 30,
                    'fiber': 5
                },
                'ingredients': ['Greek yogurt', 'mixed berries', 'almonds', 'honey'],
                'benefits': 'High in protein and fiber, good probiotics'
            },
            {
                'name': 'Egg white omelette with vegetables',
                'nutrition': {
                    'calories': 250,
                    'protein': 25,
                    'carbs': 15,
                    'fiber': 4
                },
                'ingredients': ['egg whites', 'spinach', 'tomatoes', 'mushrooms'],
                'benefits': 'High protein, low calorie, rich in vitamins'
            }
        ],
        'low_calorie': [
            {
                'name': 'Oatmeal with fruit',
                'nutrition': {
                    'calories': 200,
                    'protein': 6,
                    'carbs': 35,
                    'fiber': 4
                },
                'ingredients': ['oats', 'banana', 'cinnamon', 'almond milk'],
                'benefits': 'Low calorie, high fiber, steady energy'
            }
        ]
    },
    'lunch': {
        'high_protein': [
            {
                'name': 'Grilled chicken salad',
                'nutrition': {
                    'calories': 400,
                    'protein': 35,
                    'carbs': 20,
                    'fiber': 6
                },
                'ingredients': ['chicken breast', 'mixed greens', 'olive oil', 'vegetables'],
                'benefits': 'High protein, low carb, rich in nutrients'
            }
        ],
        'low_calorie': [
            {
                'name': 'Vegetable soup with quinoa',
                'nutrition': {
                    'calories': 300,
                    'protein': 12,
                    'carbs': 45,
                    'fiber': 8
                },
                'ingredients': ['quinoa', 'mixed vegetables', 'vegetable broth', 'herbs'],
                'benefits': 'Low calorie, high fiber, plant-based protein'
            }
        ]
    },
    'dinner': {
        'high_protein': [
            {
                'name': 'Baked salmon with roasted vegetables',
                'nutrition': {
                    'calories': 450,
                    'protein': 40,
                    'carbs': 25,
                    'fiber': 7
                },
                'ingredients': ['salmon', 'broccoli', 'sweet potato', 'olive oil'],
                'benefits': 'High protein, omega-3 fatty acids, nutrient-dense'
            }
        ],
        'low_calorie': [
            {
                'name': 'Turkey and vegetable stir-fry',
                'nutrition': {
                    'calories': 350,
                    'protein': 30,
                    'carbs': 30,
                    'fiber': 6
                },
                'ingredients': ['turkey breast', 'mixed vegetables', 'brown rice', 'soy sauce'],
                'benefits': 'Lean protein, low calorie, high fiber'
            }
        ]
    },
    'snack': {
        'high_protein': [
            {
                'name': 'Protein smoothie',
                'nutrition': {
                    'calories': 200,
                    'protein': 20,
                    'carbs': 25,
                    'fiber': 4
                },
                'ingredients': ['protein powder', 'banana', 'almond milk', 'spinach'],
                'benefits': 'High protein, good for recovery, nutrient-rich'
            }
        ],
        'low_calorie': [
            {
                'name': 'Apple slices with almond butter',
                'nutrition': {
                    'calories': 150,
                    'protein': 5,
                    'carbs': 20,
                    'fiber': 4
                },
                'ingredients': ['apple', 'almond butter'],
                'benefits': 'Low calorie, healthy fats, steady energy'
            }
        ]
    },
    'food_swaps': {
        'high_calorie': [
            {
                'from': 'White bread',
                'to': 'Whole grain bread',
                'benefit': 'More fiber, better blood sugar control'
            },
            {
                'from': 'Regular pasta',
                'to': 'Zucchini noodles',
                'benefit': 'Lower calories, more vegetables'
            }
        ],
        'low_protein': [
            {
                'from': 'Regular yogurt',
                'to': 'Greek yogurt',
                'benefit': 'Higher protein, better satiety'
            },
            {
                'from': 'White rice',
                'to': 'Quinoa',
                'benefit': 'More protein, higher fiber'
            }
        ]
    },
    'ibd_friendly': {
        'safe_foods': [
            'banana',
            'white rice',
            'chicken breast',
            'fish',
            'smooth nut butters',
            'cooked vegetables',
            'yogurt',
            'oatmeal'
        ],
        'foods_to_avoid': [
            'raw vegetables',
            'seeds',
            'nuts',
            'spicy foods',
            'caffeine',
            'alcohol',
            'processed foods',
            'high-fiber cereals'
        ],
        'cooking_methods': [
            'steaming',
            'boiling',
            'baking',
            'poaching'
        ]
    }
} 