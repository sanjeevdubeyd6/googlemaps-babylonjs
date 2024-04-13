import React, { useEffect, useRef, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { Engine, Scene, SceneEventArgs } from "react-babylonjs";
import { Vector3 } from "@babylonjs/core/Maths/math";
import * as BABYLON from "babylonjs";
import "./App.css";

const MapAndCuboid: React.FC = () => {
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({
    lat: 0,
    lng: 0,
  });
  const [selectedPosition, setSelectedPosition] =
    useState<google.maps.LatLngLiteral>({ lat: 0, lng: 0 });
  const mapRef = useRef<any>();
  const canvasRef = useRef<any>();
  const sceneRef = useRef<any>();


  useEffect(() => {
    if (mapRef.current) {
      const bounds = mapRef.current.getBounds();
      const ne = bounds?.getNorthEast();
      const sw = bounds?.getSouthWest();
      const lat = ((ne?.lat() || 0) + (sw?.lat() || 0)) / 2;
      const lng = ((ne?.lng() || 0) + (sw?.lng() || 0)) / 2;
      setMapCenter({ lat, lng });
    }
  }, [selectedPosition]);

  const captureVisibleRegion = async () => {
    if (mapRef.current && canvasRef.current && sceneRef.current) {
      const texture = new BABYLON.Texture(
        `https://maps.googleapis.com/maps/api/staticmap?center=${selectedPosition.lat},${selectedPosition.lng}&zoom=${mapRef.current.zoom}&size=512x512&key=AIzaSyCWLxF5gjxNcLPuILwbe0hsBaRWS6BhyC0`,
        sceneRef.current
      );
      const material = new BABYLON.StandardMaterial(
        "mapTexture",
        sceneRef.current
      );
      material.diffuseTexture = texture;
      const box = sceneRef.current.getMeshByName("cuboid");
      if (box) {
        box.material = material;
      }
    }
  };
  console.log("selectedPosition....", selectedPosition)
  return (
    <div>
      <div
        style={{
          width: "70%",
          height: "100vh",
          float: "left",
        }}
      >
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAP_API_KEY || ""}>
          <GoogleMap
            center={mapCenter}
            zoom={5}
            mapContainerStyle={{ width: "100%", height: "100%" }}
            onClick={(e) =>
              setSelectedPosition({
                lat: e?.latLng?.lat() || 0,
                lng: e?.latLng?.lng() || 0,
              })
            }
            onLoad={(map) => {
              mapRef.current = map;
            }}
          >
            {selectedPosition && <Marker position={selectedPosition} />}
          </GoogleMap>
        </LoadScript>
      </div>
      <div style={{ width: "30%", height:"500px", float: "left" }}>
        <Engine canvasId="babylonJS-canvas" antialias>
          <Scene
            onSceneMount={(scene: SceneEventArgs) => {
              sceneRef.current = scene.scene;
              canvasRef.current = scene.canvas;
            }}
          >
            <arcRotateCamera
              name="arc"
              target={new Vector3(0, 1, 0)}
              alpha={-Math.PI / 2}
              beta={Math.PI / 4}
              radius={5}
              minZ={0.001}
            />
            <hemisphericLight
              name="light1"
              intensity={0.9}
              direction={Vector3.Up()}
            />
            <hemisphericLight
              name="light2"
              intensity={0.4} // Adjust intensity as needed
              direction={Vector3.Down()} // Point the light downwards
            />
            <box name="cuboid" size={2} position={new Vector3(0, 1 , 0)} />
          </Scene>
        </Engine>
      </div>
      <div style={{ textAlign: "center" }}>
        <button
          onClick={captureVisibleRegion}
          style={{
            border: "none",
            background: "transparent",
            boxShadow: "rgba(0, 0, 0, 0.3) 0px 1px 4px -1px",
            padding: "10px 15px",
            fontFamily: "Roboto",
            fontWeight: "500",
            fontSize: "16px",
            marginTop: "15px",
          }}
        >
          Apply as Texture
        </button>
      </div>
    </div>
  );
};
const App: React.FC = () => {
  return (
    <div>
      <MapAndCuboid />
    </div>
  );
};
export default App;