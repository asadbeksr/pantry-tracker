"use client";

import React, { useState, KeyboardEvent, useEffect } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Loader2, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
}

export default function Home() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    fetchInventory();
    fetchLastUpdated();
  }, []);

  const fetchInventory = async () => {
    const querySnapshot = await getDocs(collection(db, "inventory"));
    const items: InventoryItem[] = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as InventoryItem);
    });
    setInventory(items);
  };

  const fetchLastUpdated = async () => {
    try {
      const response = await fetch('https://api.github.com/repos/asadbeksr/pantry-tracker');
      const data = await response.json();
      setLastUpdated(new Date(data.updated_at).toLocaleDateString());
    } catch (error) {
      console.error('Error fetching last updated date:', error);
    }
  };

  const addItem = async () => {
    if (newItemName.trim() === "") return;
    setIsLoading(true);

    const existingItem = inventory.find(item => item.name.toLowerCase() === newItemName.toLowerCase());

    try {
      if (existingItem) {
        // If item exists, update quantity
        await updateDoc(doc(db, "inventory", existingItem.id), {
          quantity: existingItem.quantity + newItemQuantity
        });
        toast.success(`${existingItem.name} quantity increased by ${newItemQuantity}`);
      } else {
        // If item doesn't exist, add new item
        await addDoc(collection(db, "inventory"), {
          name: newItemName,
          quantity: newItemQuantity
        });
        toast.success(`${newItemName} added to inventory`);
      }

      setNewItemName("");
      setNewItemQuantity(1);
      await fetchInventory();
    } catch (error) {
      toast.error("Failed to add item");
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async (id: string, newQuantity: number) => {
    try {
      if (newQuantity === 0) {
        // Remove item if quantity is 0
        await deleteDoc(doc(db, "inventory", id));
        toast.success("Item removed from inventory");
      } else {
        // Update quantity if it's greater than 0
        await updateDoc(doc(db, "inventory", id), { quantity: newQuantity });
        toast.success("Item quantity updated");
      }
      await fetchInventory();
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, "inventory", id));
      await fetchInventory();
      toast.success("Item removed from inventory");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
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
        <div className="flex mb-2">
          <Input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Item name"
            className="flex-grow p-2 mr-2 border rounded"
          />
          <Input
            type="number"
            value={newItemQuantity}
            onChange={(e) => setNewItemQuantity(parseInt(e.target.value))}
            onKeyPress={handleKeyPress}
            min="1"
            className="w-16 p-2 border rounded transition-all duration-200 ease-in-out focus:w-20"
          />
        </div>
        <Button
          onClick={addItem}
          className="w-full p-2 bg-primary rounded text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            "Add Item"
          )}
        </Button>
      </div>

      <div className="w-full max-w-md rounded-md bg-slate-100 dark:bg-accent p-4 h-[calc(100vh-400px)] overflow-y-auto">
        <ul className="space-y-4">
          {inventory.map((item) => (
            <Card key={item.id} className="flex flex-col sm:flex-row justify-between items-center p-4">
              <span className="mb-2 sm:mb-0">{item.name} - Quantity: {item.quantity}</span>
              <div className="flex flex-wrap justify-center sm:justify-end">
                <Button
                  onClick={() => updateItem(item.id, item.quantity + 1)}
                  className="mr-2 mb-2 sm:mb-0 text-white"
                  size="sm"
                >
                  +
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => updateItem(item.id, Math.max(0, item.quantity - 1))}
                  className="mr-2 mb-2 sm:mb-0 text-white bg-yellow-500 hover:bg-yellow-600"
                  size="sm"
                >
                  -
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteItem(item.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                  size="sm"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </ul>
      </div>

      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="link" className="absolute bottom-0 right-0 left-0 m-4">@asadbek</Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-70">
          <div className="flex justify-between space-x-4">
            <Avatar>
              <AvatarImage src="https://github.com/asadbeksr.png" />
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">
                <a href="https://github.com/asadbeksr/pantry-tracker" className="hover:underline" target="_blank" rel="noopener noreferrer">
                  @pantry-tracker
                </a>
              </h4>
              <p className="text-sm">
                Pantry Tracker by <a href="https://www.asadbek.me" className="text-primary" target="_blank" rel="noopener noreferrer">asadbek</a>
              </p>
              <div className="flex items-center pt-2">
                <CalendarDays className="mr-2 h-4 w-4 opacity-70" />{" "}
                <span className="text-xs text-muted-foreground">
                  Last updated: {lastUpdated || 'Loading...'}
                </span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </main>
  );
}
