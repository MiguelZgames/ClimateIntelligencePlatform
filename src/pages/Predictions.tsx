import React from 'react';

export default function Predictions() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">ML Predictions & Insights</h1>
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Run New Prediction</h2>
        <div className="flex gap-4">
            <select className="border p-2 rounded">
                <option>Select City</option>
                <option>Tokyo</option>
                <option>New York</option>
                <option>London</option>
            </select>
            <select className="border p-2 rounded">
                <option>Model: XGBoost</option>
                <option>Model: LSTM</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Predict</button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Results</h2>
        <p className="text-gray-500">Select parameters to see predictions and SHAP values.</p>
      </div>
    </div>
  );
}
