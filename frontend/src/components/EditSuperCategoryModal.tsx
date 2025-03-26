import { useState } from "react"
import "../styles/EditCategoryModal.css"
import { updateSuperCategoryName, deleteSuperCategory } from "../services/menu.service"

interface EditSuperCategoryModalProps {
  oldSuperCategory: string
  onClose: () => void
  onSave: () => void
}

const EditSuperCategoryModal = ({
  oldSuperCategory,
  onClose,
  onSave,
}: EditSuperCategoryModalProps) => {
  const [newName, setNewName] = useState(oldSuperCategory)

  const handleSave = async () => {
    if (!newName.trim()) {
      alert("Supercategory name cannot be empty.")
      return
    }

    try {
      await updateSuperCategoryName(oldSuperCategory, newName.trim())
      onSave()
      onClose()
    } catch (error) {
      console.error("Failed to update supercategory:", error)
      alert("Error updating supercategory.")
    }
  }

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${oldSuperCategory}" and all its contents?`)) {
      try {
        await deleteSuperCategory(oldSuperCategory)
        onSave()
        onClose()
      } catch (error) {
        console.error("Failed to delete supercategory:", error)
        alert("Error deleting supercategory.")
      }
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>✖</button>
        <h2 className="modal-title">Edit Supercategory</h2>

        <div className="input-group">
          <label>Supercategory Name</label>
          <input
            type="text"
            value={newName || ""}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>

        <div className="modal-actions">
          <button className="delete-btn" onClick={handleDelete}>Delete</button>
          <button className="save-btn" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  )
}

export default EditSuperCategoryModal
