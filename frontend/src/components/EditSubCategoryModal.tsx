import { useState } from "react"
import "../styles/EditCategoryModal.css"
import {
  updateSubCategoryName,
  deleteSubCategory,
} from "../services/menu.service"

interface EditSubCategoryModalProps {
  oldSubCategory: string
  currentSuperCategory: string
  onClose: () => void
  onSave: () => void
}

const EditSubCategoryModal = ({
  oldSubCategory,
  currentSuperCategory,
  onClose,
  onSave,
}: EditSubCategoryModalProps) => {
  const [newName, setNewName] = useState(oldSubCategory)

  const handleSave = async () => {
    if (!newName.trim()) {
      alert("Subcategory name cannot be empty.")
      return
    }

    try {
      await updateSubCategoryName(oldSubCategory, currentSuperCategory, newName.trim())
      onSave()
      onClose()
    } catch (error) {
      console.error("Failed to update subcategory:", error)
      alert("Error updating subcategory.")
    }
  }

  const handleDelete = async () => {
    if (
      confirm(
        `Are you sure you want to delete the subcategory "${oldSubCategory}" and all its items?`
      )
    ) {
      try {
        await deleteSubCategory(oldSubCategory, currentSuperCategory)
        onSave()
        onClose()
      } catch (error) {
        console.error("Failed to delete subcategory:", error)
        alert("Error deleting subcategory.")
      }
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
        <h2 className="modal-title">Edit Subcategory</h2>

        <div className="input-group">
          <label>Subcategory Name</label>
          <input
            type="text"
            value={newName || ""}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>

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

export default EditSubCategoryModal
