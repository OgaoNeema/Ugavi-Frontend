import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup, LayersControl } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import Geocoder from './Geocoder';
import Modal from './Modal'; // Import your Modal component
import './crudForm.css';

const { BaseLayer } = LayersControl;

// Create a mapping for label choices
const LABEL_CHOICES = {
  'Farm': 'farms',
  'Processing Facility': 'processing-facilities',
  'Distribution Center': 'distribution-centers',
  'Warehouse': 'warehouses',
  'Restaurant': 'restaurants',
  'Supermarket': 'supermarkets'
};

// Create a mapping for region choices
const REGION_CHOICES = {
  'Central': 'central',
  'Coast': 'coast',
  'Eastern': 'eastern',
  'Nairobi': 'nairobi',
  'North Eastern': 'north-eastern',
  'Nyanza': 'nyanza',
  'Rift Valley': 'rift-valley',
  'Western': 'western'
};

const AddLocation = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [label, setLabel] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [region, setRegion] = useState('');
  const [description, setDescription] = useState('');
  const [farmName, setFarmName] = useState('');
  const [farms, setFarms] = useState([]); // Define farms state
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const mapRef = useRef();
  const markerRef = useRef();

  useEffect(() => {
    const fetchFarms = async () => {
      const res = await fetch('http://localhost:8000/api/fieldmapping/farms/');
      const data = await res.json();
      setFarms(data); // Update farms state
    };

    fetchFarms();
  }, []);

  const onCreated = (e) => {
    const { layerType, layer } = e;
    if (layerType === 'marker') {
      const { lat, lng } = layer.getLatLng();
      setLatitude(lat);
      setLongitude(lng);
      mapRef.current.flyTo([lat, lng], 15);
      markerRef.current = layer; // Store reference to the marker
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!id || !name || !latitude || !longitude) {
      alert('Please add all required location details');
      return;
    }

    // Map the label and region to the corresponding values
    const labelValue = LABEL_CHOICES[label] || '';
    const regionValue = REGION_CHOICES[region] || '';

    onAdd({
      // id,
      name,
      label: labelValue, // Use the mapped label value
      location: `SRID=4326;POINT (${longitude} ${latitude})`,
      region: regionValue, // Use the mapped region value
      description,
      farmName: labelValue === 'farms' ? farmName : undefined, // Update farmName condition
    });

    // Reset form fields
    setId('');
    setName('');
    setLabel('');
    setLatitude('');
    setLongitude('');
    setRegion('');
    setDescription('');
    setFarmName('');
    
    // Open modal to show success message
    setIsModalOpen(true);
    
    if (markerRef.current) {
      markerRef.current.remove(); // Remove the marker from the map
      markerRef.current = null;
    }

    mapRef.current.flyTo([0, 38], 8); // Reset map to initial position
  };

  return (
    <>
      <div className="add-location-container">
        <div className="form-sidebar-container">
          <form className="add-location-form" onSubmit={onSubmit}>
            <h2 className='LocationTitle'>Enter Location Details</h2>
            <div className="form-control">
              <label>Location Name</label>
              <input
                type="text"
                placeholder="Add Location Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label>Identification Number</label>
              <input
                type="text"
                placeholder="Add Identification Number"
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label>Label</label>
              <select value={label} onChange={(e) => setLabel(e.target.value)}>
                <option value="">Select Label</option>
                {Object.keys(LABEL_CHOICES).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
            {label === 'Farm' && (
              <div className="form-control">
                <label>Farm</label>
                <select value={farmName} onChange={(e) => setFarmName(e.target.value)}>
                  <option value="">Select Farm</option>
                  {farms.map((farm) => (
                    <option key={farm.name} value={farm.name}>
                      {farm.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-control">
              <label>Latitude</label>
              <input
                type="text"
                placeholder="Add Latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label>Longitude</label>
              <input
                type="text"
                placeholder="Add Longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label>Region</label>
              <select value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="">Select Region</option>
                {Object.keys(REGION_CHOICES).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label>Description</label>
              <textarea
                type="text"
                placeholder="Add Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
              />
            </div>
            <input type="submit" value="Save Location" className="btn" />
          </form>
        </div>
        <MapContainer center={[0, 38]} zoom={8} className='leaflet-container' ref={mapRef}>
          <Geocoder />
          <LayersControl position="topright">
            <BaseLayer checked name='Google Hybrid Map'>
              <TileLayer
                url="http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
                attribution='&copy; Google Maps'
                subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                maxZoom={23}
              />
            </BaseLayer>
            <BaseLayer name='Terrain Map'>
              <TileLayer
                url="http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
                attribution='&copy; Google Maps'
                subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                maxZoom={20}
              />
            </BaseLayer>
            <BaseLayer name='Esri World'>
              <TileLayer
                url="http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                maxZoom={20}
              />
            </BaseLayer>
          </LayersControl>
          <FeatureGroup>
            <EditControl
              position="topright"
              draw={{
                rectangle: false,
                circle: false,
                circlemarker: false,
                polyline: false,
                polygon: false
              }}
              onCreated={onCreated}
            />
          </FeatureGroup>
        </MapContainer>
      </div>

      {/* Modal to show success message */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default AddLocation;
