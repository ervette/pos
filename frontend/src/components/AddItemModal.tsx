import { useState, useEffect } from "react"
import "../styles/AddItemModal.css"
import {
  createMenuItem,
  IMenuItemPayload,
  getMenuCategories,
  MenuCategory,
} from "../services/menu.service"

interface AddItemModalProps {
  onClose: () => void
  onSave: () => void // Adjust type based on your backend
  superCategories: string[]
  subCategories: string[]
}

const AddItemModal = ({
  onClose,
  onSave,
  superCategories,
}: AddItemModalProps) => {
  const [superCategory, setSuperCategory] = useState("")
  const [subCategory, setSubCategory] = useState("")
  const [itemName, setItemName] = useState("")
  const [variations, setVariations] = useState([{ type: "", price: "" }])
  const [modifiers, setModifiers] = useState([{ type: "", price: "" }])
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [filteredSubCategories, setFilteredSubCategories] = useState<string[]>(
    []
  )

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getMenuCategories()
        setCategories(data)
      } catch (err) {
        console.error("Failed to fetch categories:", err)
      }
    }

    fetchCategories()
  }, []) // Run only once when modal mounts

  useEffect(() => {
    if (superCategory) {
      const category = categories.find((c) => c.superCategory === superCategory)
      setFilteredSubCategories(category ? category.subCategories : [])
    } else {
      setFilteredSubCategories([])
    }
  }, [superCategory, categories])

  const handleVariationChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...variations]
    updated[index][field as "type" | "price"] = value
    setVariations(updated)
  }

  const handleModifierChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...modifiers]
    updated[index][field as "type" | "price"] = value
    setModifiers(updated)
  }

  const addVariation = () =>
    setVariations([...variations, { type: "", price: "" }])
  const removeVariation = (index: number) =>
    setVariations(variations.filter((_, i) => i !== index))

  const addModifier = () =>
    setModifiers([...modifiers, { type: "", price: "" }])
  const removeModifier = (index: number) =>
    setModifiers(modifiers.filter((_, i) => i !== index))

  const handleSave = async () => {
    // 🔍 Basic validation
    if (!superCategory.trim()) {
      alert("Supercategory is required.")
      return
    }
    if (!subCategory.trim()) {
      alert("Subcategory is required.")
      return
    }
    if (!itemName.trim()) {
      alert("Item name is required.")
      return
    }
    if (
      variations.length === 0 ||
      variations.some((v) => !v.type.trim() || isNaN(Number(v.price)))
    ) {
      alert("Please provide valid variation type and price.")
      return
    }

    // Construct payload (same as before)
    const payload: IMenuItemPayload = {
      superCategory,
      subCategory,
      itemName,
      variations: variations.map((v) => ({
        type: v.type.trim(),
        price: parseFloat(v.price),
      })),
      modifiers: modifiers.map((m) => ({
        type: m.type.trim(),
        price: parseFloat(m.price),
      })),
    }

    try {
      await createMenuItem(payload)
      onSave()
      onClose()
    } catch (err) {
      console.error("Error saving item:", err)
      alert("Error: " + (err as Error).message)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
        <h2 className="modal-title">Add Item</h2>

        <div className="category-inputs">
          <div className="input-group">
            <label>Supercategory</label>
            <input
              list="superCategoryList"
              value={superCategory}
              onChange={(e) => setSuperCategory(e.target.value)}
              placeholder="Select or create..."
            />
            <datalist id="superCategoryList">
              {superCategories.map((cat) => (
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
              placeholder="Select or create..."
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
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Item Name"
            />
          </div>
        </div>

        <hr className="vertical-separator" />

        {/* Variations Section */}
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

        {/* Modifiers Section */}
        <div className="section-header">
          <h3>Modifiers</h3>
          <button onClick={addModifier}>＋</button>
        </div>
        {modifiers.map((modifier, index) => (
          <div className="dynamic-row" key={index}>
            <input
              type="text"
              placeholder="Type"
              value={modifier.type}
              onChange={(e) =>
                handleModifierChange(index, "type", e.target.value)
              }
            />
            <input
              type="number"
              placeholder="£ Price"
              value={modifier.price}
              onChange={(e) =>
                handleModifierChange(index, "price", e.target.value)
              }
            />
            {index > 0 && (
              <button onClick={() => removeModifier(index)}>Remove</button>
            )}
          </div>
        ))}

        <button className="save-btn" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  )
}

export default AddItemModal
