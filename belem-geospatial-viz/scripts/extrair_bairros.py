import requests
import json
import geopandas as gpd
from shapely.geometry import Polygon, MultiPolygon, LineString
from shapely.ops import polygonize, unary_union
import os
import time

def query_overpass(query, max_retries=3):
    """Executa uma query Overpass com retry"""
    url = "https://overpass-api.de/api/interpreter"
    
    for attempt in range(max_retries):
        try:
            response = requests.post(url, data={'data': query}, timeout=300)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.Timeout:
            print(f"      Timeout, tentativa {attempt+1}/{max_retries}...")
            time.sleep(10)
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"      Erro, tentativa {attempt+1}/{max_retries}: {str(e)[:50]}")
                time.sleep(10)
            else:
                raise
    return None

def process_relation(elem):
    """Processa uma relation e retorna um feature GeoJSON ou None"""
    tags = elem.get('tags', {})
    name = tags.get('name', '')
    
    if not name:
        return None
    
    members = elem.get('members', [])
    outer_coords_list = []
    
    for member in members:
        # Aceita tanto 'outer' quanto membros sem role específico para multipolygons
        if member.get('type') == 'way' and 'geometry' in member:
            role = member.get('role', '')
            if role in ['outer', ''] or 'outer' in role:
                coords = [(pt['lon'], pt['lat']) for pt in member['geometry']]
                if len(coords) >= 2:
                    outer_coords_list.append(coords)
    
    if not outer_coords_list:
        return None
    
    try:
        lines = [LineString(coords) for coords in outer_coords_list]
        merged = unary_union(lines)
        polygons = list(polygonize(merged))
        
        if polygons:
            geom = polygons[0] if len(polygons) == 1 else MultiPolygon(polygons)
            feature = {
                "type": "Feature",
                "properties": {
                    "name": name,
                    "admin_level": tags.get('admin_level', '10'),
                    "osm_id": elem['id']
                },
                "geometry": geom.__geo_interface__
            }
            return feature
    except Exception as e:
        print(f"   ! Erro ao processar {name}: {str(e)[:40]}")
    
    return None

def extrair_bairros():
    print("="*60)
    print("EXTRAÇÃO DE BAIRROS DE BELÉM VIA OVERPASS API")
    print("="*60)
    
    all_features = []
    existing_names = set()
    
    # =====================================================
    # 1. Buscar bairros de Belém (relations admin_level=10)
    # =====================================================
    print("\n1. Buscando bairros (admin_level=10) em Belém...")
    
    query = """
    [out:json][timeout:300];
    area["name"="Belém"]["admin_level"="8"]->.belem;
    relation["admin_level"="10"]["boundary"="administrative"](area.belem);
    out geom;
    """
    
    try:
        data = query_overpass(query)
        if data:
            elements = data.get('elements', [])
            print(f"   Recebidos {len(elements)} relations")
            
            for elem in elements:
                if elem['type'] == 'relation':
                    feature = process_relation(elem)
                    if feature and feature['properties']['name'] not in existing_names:
                        all_features.append(feature)
                        existing_names.add(feature['properties']['name'])
                        print(f"   + {feature['properties']['name']}")
                        
    except Exception as e:
        print(f"   ! Erro: {e}")
    
    print(f"\n   Subtotal: {len(all_features)} bairros")
    
    # =====================================================
    # 2. Buscar ilhas ESPECÍFICAS por ID
    # =====================================================
    print("\n2. Buscando ilhas específicas por ID...")
    
    # IDs das relations que queremos
    ilhas_ids = [
        1162522,  # Ilha do Mosqueiro
        # Adicionar IDs de Cotijuba e Combu se soubermos
    ]
    
    for rel_id in ilhas_ids:
        print(f"   Buscando relation {rel_id}...")
        query_ilha = f"""
        [out:json][timeout:120];
        relation({rel_id});
        out geom;
        """
        
        time.sleep(2)
        try:
            data = query_overpass(query_ilha)
            if data:
                for elem in data.get('elements', []):
                    if elem['type'] == 'relation':
                        feature = process_relation(elem)
                        if feature:
                            name = feature['properties']['name']
                            if name not in existing_names:
                                feature['properties']['admin_level'] = '9'  # Marcar como ilha
                                all_features.append(feature)
                                existing_names.add(name)
                                print(f"   + {name}")
        except Exception as e:
            print(f"   ! Erro: {e}")
    
    # =====================================================
    # 3. Buscar Cotijuba e Combu por nome
    # =====================================================
    print("\n3. Buscando Cotijuba e Combu...")
    
    query_ilhas = """
    [out:json][timeout:120];
    (
      relation["name"="Ilha Cotijuba"];
      relation["name"="Ilha do Combu"];
      relation["name"~"Cotijuba"]["place"="island"];
      relation["name"~"Combu"]["place"="island"];
    );
    out geom;
    """
    
    time.sleep(2)
    try:
        data = query_overpass(query_ilhas)
        if data:
            for elem in data.get('elements', []):
                if elem['type'] == 'relation':
                    feature = process_relation(elem)
                    if feature:
                        name = feature['properties']['name']
                        if name not in existing_names:
                            feature['properties']['admin_level'] = '9'
                            all_features.append(feature)
                            existing_names.add(name)
                            print(f"   + {name}")
    except Exception as e:
        print(f"   ! Erro: {e}")
    
    # =====================================================
    # CONSOLIDAR E SALVAR
    # =====================================================
    print("\n" + "="*60)
    print("CONSOLIDANDO DADOS...")
    print("="*60)
    
    if not all_features:
        print("Nenhum dado encontrado!")
        return
    
    geojson = {"type": "FeatureCollection", "features": all_features}
    gdf = gpd.GeoDataFrame.from_features(geojson, crs="EPSG:4326")
    
    print(f"Total antes da limpeza: {len(gdf)}")
    
    # Remover registros indesejados
    blacklist = [
        "Pará", "Ananindeua", "Marituba", "Benevides",
        "Santa Bárbara do Pará", "Acará", "Barcarena",
        "Região Geográfica Imediata de Belém",
        "Região Geográfica Intermediária de Belém",
        "Atalaia", "Icuí-Laranjeira", "Jarderlândia", "Jiboia Branca", "Júlia Sefer",
        "Bradfield Combust with Stanningfield",  # Erro de busca
        "Mosqueiro",  # Vamos usar "Ilha do Mosqueiro" em vez disso
    ]
    
    if 'name' in gdf.columns:
        gdf = gdf[~gdf['name'].isin(blacklist)]
    
    print(f"Total após limpeza: {len(gdf)}")
    
    # Salvar
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, "..", "public", "data")
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "belem_bairros.geojson")
    
    gdf.to_file(output_file, driver='GeoJSON')
    
    print(f"\nSUCESSO! {len(gdf)} registros exportados")
    
    if 'name' in gdf.columns:
        print("\nBairros encontrados:")
        for name in sorted(gdf['name'].dropna().unique()):
            print(f"  - {name}")

if __name__ == "__main__":
    extrair_bairros()
