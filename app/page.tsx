"use client";

import React, { useState, KeyboardEvent } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
}

export default function Home() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(1);

  const addItem = () => {
    if (newItemName.trim() === "") return;

    const existingItemIndex = inventory.findIndex(item => item.name.toLowerCase() === newItemName.toLowerCase());

    if (existingItemIndex !== -1) {
      // If item exists, update quantity
      const updatedInventory = [...inventory];
      updatedInventory[existingItemIndex].quantity += newItemQuantity;
      setInventory(updatedInventory);
    } else {
      // If item doesn't exist, add new item
      const newItem: InventoryItem = {
        id: Date.now().toString(),
        name: newItemName,
        quantity: newItemQuantity
      };
      setInventory([...inventory, newItem]);
    }

    setNewItemName("");
    setNewItemQuantity(1);
  };

  const updateItem = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      // Remove item if quantity is 0
      const updatedInventory = inventory.filter(item => item.id !== id);
      setInventory(updatedInventory);
    } else {
      // Update quantity if it's greater than 0
      const updatedInventory = inventory.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
      setInventory(updatedInventory);
    }
  };

  const deleteItem = (id: string) => {
    const updatedInventory = inventory.filter(item => item.id !== id);
    setInventory(updatedInventory);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addItem();
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center md:pt-24 md:px-6 pt-24 px-4">
      {/* // locate moddle to the right top */}
      <div className="absolute top-0 right-0 m-4">
        <ModeToggle />
      </div>


      <h1 className="text-4xl font-bold mb-8">Inventory Management</h1>

      <div className="w-full max-w-md mb-8">
        <Input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Item name"
          className="w-full p-2 mb-2 border rounded"
        />
        <Input
          type="number"
          value={newItemQuantity}
          onChange={(e) => setNewItemQuantity(parseInt(e.target.value))}
          onKeyPress={handleKeyPress}
          min="1"
          className="w-full p-2 mb-2 border rounded "
        />
        <Button
          onClick={addItem}
          className="w-full p-2 bg-primary rounded text-white"
        >
          Add Item
        </Button>
      </div>

      <div className="w-full max-w-md rounded-md bg-slate-100 dark:bg-accent p-4 h-[calc(100vh-400px)] overflow-y-auto">
        <ul className="space-y-4">
          {inventory.map((item) => (
            <Card key={item.id} className="flex justify-between items-center p-4">
              <span>{item.name} - Quantity: {item.quantity}</span>
              <div>
                <Button
                  onClick={() => updateItem(item.id, item.quantity + 1)}
                  className="mr-2 text-white"
                >
                  +
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => updateItem(item.id, Math.max(0, item.quantity - 1))}
                  className="mr-2 text-white bg-yellow-500 hover:bg-yellow-600"
                >
                  -
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteItem(item.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </ul>
      </div>
    </main>
  );
}
