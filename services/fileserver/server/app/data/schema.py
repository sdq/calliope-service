def load_schema(df):
    columns = df.columns.values.tolist()
    statistics = {
        "column": df.shape[1],
        "row": df.shape[0],
        "numerical": 0,
        "categorical": 0,
        "temporal": 0,
        "column_high_cardinality": 0,
        "column_constant": 0,
    }
    fields = []
    for column in columns:
        field = {
            "field": column
        }
        if df[column].dtype == "datetime64[ns]":
            field["type"] = "temporal"
            field["values"] = df[column].unique()
            statistics["temporal"] += 1
        elif df[column].dtype == "object":
            field["type"] = "categorical"
            field["values"] = df[column].unique()
            statistics["categorical"] += 1
        else:
            field["type"] = "numerical"
            statistics["numerical"] += 1
        field["cardinality"] = df[column].nunique()

        # TODO: deal with meaningless column
        # # filter column with high cardinality 
        # if field["type"] == "categorical" and field["cardinality"]/statistics['row'] >= 0.2:
        #     statistics["categorical"] -= 1
        #     statistics["column"] -= 1
        #     statistics["column_high_cardinality"] += 1
        #     continue
        # filter column with constant
        if field["type"] == "categorical" and field["cardinality"] == 1:
            statistics["categorical"] -= 1
            statistics["column"] -= 1
            statistics["column_constant"] += 1
            continue

        fields.append(field)
        
    return {
        "statistics": statistics,
        "fields": fields
    }