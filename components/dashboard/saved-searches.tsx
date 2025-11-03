"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Edit, Trash2, Play } from "lucide-react"

interface SavedSearch {
  id: string
  name: string
  make: string
  max_mileage: number
  max_price: number
  min_year: number
  fuel_type: string
  is_active: boolean
  created_at: string
}

interface SavedSearchesProps {
  dealer: any
  savedSearches: SavedSearch[]
}

export default function SavedSearches({ dealer, savedSearches }: SavedSearchesProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newSearch, setNewSearch] = useState({
    name: "",
    make: "",
    maxMileage: "",
    maxPrice: "",
    minYear: "",
    fuelType: "",
  })

  const handleSaveSearch = async () => {
    // In real app, this would call API to save search
    console.log("Saving search:", newSearch)
    setIsDialogOpen(false)
    setNewSearch({
      name: "",
      make: "",
      maxMileage: "",
      maxPrice: "",
      minYear: "",
      fuelType: "",
    })
  }

  const toggleSearch = async (searchId: string, isActive: boolean) => {
    // In real app, this would call API to toggle search
    console.log("Toggling search:", searchId, !isActive)
  }

  const deleteSearch = async (searchId: string) => {
    // In real app, this would call API to delete search
    console.log("Deleting search:", searchId)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Saved Searches
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Saved Search</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Search name (e.g., Mercedes Diesel Under £15k)"
                  value={newSearch.name}
                  onChange={(e) => setNewSearch({ ...newSearch, name: e.target.value })}
                />
                <Select value={newSearch.make} onValueChange={(value) => setNewSearch({ ...newSearch, make: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Make" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mercedes">Mercedes</SelectItem>
                    <SelectItem value="BMW">BMW</SelectItem>
                    <SelectItem value="Audi">Audi</SelectItem>
                    <SelectItem value="Volkswagen">Volkswagen</SelectItem>
                    <SelectItem value="Ford">Ford</SelectItem>
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Max mileage"
                    type="number"
                    value={newSearch.maxMileage}
                    onChange={(e) => setNewSearch({ ...newSearch, maxMileage: e.target.value })}
                  />
                  <Input
                    placeholder="Max price £"
                    type="number"
                    value={newSearch.maxPrice}
                    onChange={(e) => setNewSearch({ ...newSearch, maxPrice: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Min year"
                    type="number"
                    value={newSearch.minYear}
                    onChange={(e) => setNewSearch({ ...newSearch, minYear: e.target.value })}
                  />
                  <Select
                    value={newSearch.fuelType}
                    onValueChange={(value) => setNewSearch({ ...newSearch, fuelType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Petrol">Petrol</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="Electric">Electric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSaveSearch} className="w-full">
                  Save Search
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {savedSearches.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No saved searches yet.</p>
            <p className="text-xs">Create searches to get instant alerts for matching cars.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {savedSearches.map((search) => (
              <div key={search.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-sm">{search.name}</h3>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSearch(search.id, search.is_active)}
                      className="h-6 w-6 p-0"
                    >
                      <Play className={`w-3 h-3 ${search.is_active ? "text-green-600" : "text-muted-foreground"}`} />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSearch(search.id)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 text-xs">
                  <Badge variant="outline">{search.make}</Badge>
                  <Badge variant="outline">≤{search.max_mileage.toLocaleString()}mi</Badge>
                  <Badge variant="outline">≤£{search.max_price.toLocaleString()}</Badge>
                  <Badge variant="outline">≥{search.min_year}</Badge>
                  {search.fuel_type && <Badge variant="outline">{search.fuel_type}</Badge>}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant={search.is_active ? "default" : "secondary"} className="text-xs">
                    {search.is_active ? "Active" : "Paused"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Created {new Date(search.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
