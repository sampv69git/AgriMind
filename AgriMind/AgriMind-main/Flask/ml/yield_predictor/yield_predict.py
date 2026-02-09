from yield_model_training import predict_yield_for_crops

# Example usage
numeric_features = [100, 50, 50, 27, 85, 6.5, 180, 40, 7, 5]
top_3_crops = ['rice', 'wheat', 'maize']  # Example: output from crop recommendation model

yields = predict_yield_for_crops(numeric_features, top_3_crops)
print("Predicted yields (tonnes/ha):", yields)
