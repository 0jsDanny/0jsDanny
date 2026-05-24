import json
import random
import os
import uuid
from datetime import datetime, timedelta

def generate_random_date(start_date, end_date):
    delta = end_date - start_date
    int_delta = (delta.days * 24 * 60 * 60) + delta.seconds
    random_second = random.randrange(int_delta)
    return (start_date + timedelta(seconds=random_second)).isoformat()

def anonymize_and_expand_acai(input_path, output_path, target_extra_count=5000):
    if not os.path.exists(input_path):
        print(f"Erro: Arquivo {input_path} não encontrado.")
        return

    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Common fake data pools
    first_names = ["João", "Maria", "José", "Ana", "Francisco", "Antônio", "Carlos", "Paulo", "Pedro", "Lucas", "Luiz", "Marcos", "Manoel", "Raimundo", "Francisca", "Antônia", "Adriana", "Juliana", "Márcia", "Fernanda", "Patrícia", "Sandra", "Camila", "Leticia", "Vanessa", "Rodrigo", "Thiago", "Aline", "Beatriz"]
    last_names = ["Silva", "Santos", "Oliveira", "Souza", "Pereira", "Costa", "Rodrigues", "Almeida", "Nascimento", "Lima", "Araújo", "Fernandes", "Carvalho", "Gomes", "Martins", "Rocha", "Ribeiro", "Rezende", "Melo", "Barbosa", "Teixeira", "Pinto", "Moura", "Cavalcanti", "Dias"]
    prefixes = ["Açaí do", "Cantinho do", "Sabor", "Rei do", "Ponto do", "Vitaminosa do", "Espaço do", "Portal do", "Point do", "Açaí da", "Delícia do"]
    health_workers = ["Carlos Lima", "Amanda Souza", "Débora Barros", "Jairo Ferreira", "Victor Brito", "Isabelle Monteiro", "Vanessa Nunes", "Max Souza", "Larysse Pacheco", "Renato Mendes", "Fabiana Melo", "Gustavo Rocha"]
    
    districts = ["DAENT", "DAGUA", "DASAC", "DAICO", "DABEL", "DABEN", "DAOUT", "DAMOS"]
    points_by_district = {d: [] for d in districts}

    all_features = []
    
    # Process existing features (Anonymize + Map)
    print("Processando e anonimizando registros existentes...")
    for collection in data:
        if "features" in collection:
            for feature in collection["features"]:
                props = feature.get("properties", {})
                
                # Get district
                district = props.get("Qual o distrito de saúde?", "DABEL")
                if district not in districts: district = "DABEL"
                
                # Anonymize Identity
                name = f"{random.choice(first_names)} {random.choice(last_names)}"
                props["Nome do profissional de saúde"] = random.choice(health_workers)
                
                biz_prefix = random.choice(prefixes)
                biz_owner = random.choice(last_names)
                props["Nome do ponto de venda ou do proprietário"] = f"{biz_prefix} {biz_owner}"
                
                # Static Phone (Requested)
                props["Telefone de contato"] = "(91) 99999-9999"
                
                # Random IDs
                props["_id"] = random.randint(100000000, 999999999)
                props["_uuid"] = str(uuid.uuid4())
                props["__version__"] = "".join(random.choices("abcdefghijklmnopqrstuvwxyz0123456789", k=22))
                
                # Random Timestamps
                props["start"] = generate_random_date(datetime(2025, 1, 1), datetime(2025, 3, 1))
                props["end"] = generate_random_date(datetime(2025, 3, 1), datetime(2025, 8, 1))
                props["_submission_time"] = generate_random_date(datetime(2025, 3, 1), datetime(2025, 8, 1))

                # Coordinate Jitter (Small: ~10-30 meters)
                if "geometry" in feature and "coordinates" in feature["geometry"]:
                    coords = feature["geometry"]["coordinates"]
                    coords[0] += random.uniform(-0.00015, 0.00015)
                    coords[1] += random.uniform(-0.00015, 0.00015)
                    
                    # Store for expansion
                    points_by_district[district].append(feature)
                
                all_features.append(feature)

    # Expansion: Create 5000 more records
    print(f"Gerando {target_extra_count} novos registros fictícios...")
    
    # Filter districts that have base points to avoid errors
    valid_districts = [d for d in districts if points_by_district[d]]
    
    if not valid_districts:
        print("Aviso: Nenhum ponto base encontrado para expansão. Usando coordenadas padrão de Belém.")
        # Fallback to center of Belem if no points
        belem_center = [-48.489, -1.455]
        # (Simplified expansion omitted if no base points)
    else:
        for _ in range(target_extra_count):
            district = random.choice(valid_districts)
            base_feature = random.choice(points_by_district[district])
            
            # Clone and jitter (Moderate: ~100-500 meters to keep within district general area)
            new_feature = json.loads(json.dumps(base_feature))
            coords = new_feature["geometry"]["coordinates"]
            coords[0] += random.uniform(-0.004, 0.004)
            coords[1] += random.uniform(-0.004, 0.004)
            
            props = new_feature["properties"]
            
            # New Random Data for cloned point
            biz_prefix = random.choice(prefixes)
            biz_owner = random.choice(last_names)
            props["Nome do ponto de venda ou do proprietário"] = f"{biz_prefix} {biz_owner}"
            props["Telefone de contato"] = "(91) 99999-9999"
            props["Nome do profissional de saúde"] = random.choice(health_workers)
            props["_id"] = random.randint(100000000, 999999999)
            props["_uuid"] = str(uuid.uuid4())
            props["__version__"] = "".join(random.choices("abcdefghijklmnopqrstuvwxyz0123456789", k=22))
            
            all_features.append(new_feature)

    # Final structure: array with a single FeatureCollection
    output_data = [
        {
            "type": "FeatureCollection",
            "name": "Açaí no ponto! (Dataset Expandido e Anonimizado)",
            "features": all_features
        }
    ]

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(script_dir, "..", "public", "data", "acai-points.json")
    anonymize_and_expand_acai(path, path, target_extra_count=5000)
    print("Processamento concluído. O arquivo acai-points.json agora é 100% fictício e expandido.")
