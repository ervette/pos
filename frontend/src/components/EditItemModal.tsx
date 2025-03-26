import { useState } from "react"
import "../styles/EditCategoryModal.css"
import {
  updateMenuItem,
  deleteMenuItem,
  MenuItem,
  MenuCategory,
} from "../services/menu.service"

interface EditItemModalProps {
  item: MenuItem
  categories: MenuCategory[]
  onClose: () => void
  onSave: () => void
}

const EditItemModal = ({
  item,
  categories,
  onClose,
  onSave,
}: EditItemModalProps) => {
  const [name, setName] = useState(item.name)
  const [superCategory, setSuperCategory] = useState(item.category)
  const [subCategory, setSubCategory] = useState(item.subcategory)
  const [variations, setVariations] = useState(
    item.variations.map((v) => ({ type: v.type, price: v.price }))
  )
  const [modifiers, setModifiers] = useState(item.modifiers || [])

  const handleVariationChange = (
    index: number,
    field: "type" | "price",
    value: string
  ) => {
    const updated = [...variations]
    updated[index] = {
      ...updated[index],
      [field]: field === "price" ? parseFloat(value) : value,
    }
    setVariations(updated)
  }
  

  const handleModifierChange = (index: number, value: string) => {
    const updated = [...modifiers]
    updated[index] = value
    setModifiers(updated)
  }

  const addVariation = () =>
    setVariations([...variations, { type: "", price: 0 }])
  const removeVariation = (index: number) =>
    setVariations(variations.filter((_, i) => i !== index))

  const addModifier = () => setModifiers([...modifiers, ""])
  const removeModifier = (index: number) =>
    setModifiers(modifiers.filter((_, i) => i !== index))

  const allSuperCategories = categories.map((c) => c.superCategory)
  const filteredSubCategories =
    categories.find((c) => c.superCategory === superCategory)?.subCategories ||
    []

    const handleSave = async () => {
        if (!name.trim()) {
          alert("Item name is required.")
          return
        }
      
        const updatedItem = {
          name: name.trim(),
          superCategory,
          subCategory,
          variations: variations.map((v) => ({
            type: v.type.trim(),
            price: parseFloat(String(v.price)),
          })),
          modifiers: modifiers.map((m) => m.trim()).filter((m) => m),
        }
      
        try {
          await updateMenuItem(item.itemId, updatedItem)
          onSave()
          onClose()
        } catch (error) {
          console.error("Failed to update item:", error)
          alert("Error updating item.")
        }
      }
      

  const handleDelete = async () => {
    if (confirm("Are you sure you want to permanently delete this item?")) {
      try {
        await deleteMenuItem(item.itemId)
        onSave()
        onClose()
      } catch (error) {
        console.error("Failed to delete item:", error)
        alert("Error deleting item.")
      }
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
        <h2 className="modal-title">Edit Item</h2>

        {/* Categories and Name */}
        <div className="category-inputs">
          <div className="input-group">
            <label>Supercategory</label>
            <input
              list="superCategoryList"
              value={superCategory}
              onChange={(e) => setSuperCategory(e.target.value)}
              placeholder="Change or create..."
            />
            <datalist id="superCategoryList">
              {allSuperCategories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          <div className="input-group">
            <label>Subcategory</label>
            <input
              list="subCategoryList"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              placeholder="Change or create..."
            />
            <datalist id="subCategoryList">
              {filteredSubCategories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          <div className="input-group">
            <label>Item Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Item Name"
            />
          </div>
        </div>

        <hr className="vertical-separator" />

        {/* Variations */}
        <div className="section-header">
          <h3>Variations</h3>
          <button onClick={addVariation}>＋</button>
        </div>
        {variations.map((variation, index) => (
          <div className="dynamic-row" key={index}>
            <input
              type="text"
              placeholder="Type"
              value={variation.type}
              onChange={(e) =>
                handleVariationChange(index, "type", e.target.value)
              }
            />
            <input
              type="number"
              placeholder="£ Price"
              value={variation.price}
              onChange={(e) =>
                handleVariationChange(index, "price", e.target.value)
              }
            />
            {index > 0 && (
              <button onClick={() => removeVariation(index)}>Remove</button>
            )}
          </div>
        ))}

        {/* Modifiers */}
        <div className="section-header">
          <h3>Modifiers</h3>
          <button onClick={addModifier}>＋</button>
        </div>
        {modifiers.map((modifier, index) => (
          <div className="dynamic-row" key={index}>
            <input
              type="text"
              placeholder="Modifier"
              value={modifier}
              onChange={(e) => handleModifierChange(index, e.target.value)}
            />
            {index > 0 && (
              <button onClick={() => removeModifier(index)}>Remove</button>
            )}
          </div>
        ))}

        <div className="modal-actions">
          <button className="delete-btn" onClick={handleDelete}>
            Delete
          </button>
          <button className="save-btn" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditItemModal
