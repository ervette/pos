import { useEffect, useState } from "react"
import {
  getMenuCategories,
  getMenuItemsByCategory,
} from "../services/menu.service"
import { MenuCategory, MenuItem } from "../services/menu.service"
import LogoHeader from "../components/LogoHeader"
import AddItemModal from "./AddItemModal"
import EditItemModal from "./EditItemModal"
import EditSuperCategoryModal from "./EditSuperCategoryModal"
import EditSubCategoryModal from "./EditSubCategoryModal"
import "../styles/InventoryPage.css"

const InventoryPage = () => {
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([])
  const [selectedSuperCategory, setSelectedSuperCategory] = useState<
    string | null
  >(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(
    null
  )
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [modalOpen, setModalOpen] = useState(false)

  // 🔧 Modals
  const [editItemModalOpen, setEditItemModalOpen] = useState(false)
  const [editSuperCategoryModalOpen, setEditSuperCategoryModalOpen] =
    useState(false)
  const [editSubCategoryModalOpen, setEditSubCategoryModalOpen] =
    useState(false)

  // 🔧 Selected for Editing
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [selectedSuperCategoryForEdit, setSelectedSuperCategoryForEdit] =
    useState<string | null>(null)
  const [selectedSubCategoryForEdit, setSelectedSubCategoryForEdit] = useState<
    string | null
  >(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await getMenuCategories()
        setMenuCategories(categories)
      } catch (error) {
        console.error("Error fetching menu categories:", error)
      }
    }

    fetchCategories()
  }, [])

  const handleSaveNewItem = () => {
    // Send to backend API
    setModalOpen(true)
  }

  const handleSuperCategoryClick = (superCategory: string) => {
    if (selectedSuperCategory === superCategory) {
      setSelectedSuperCategory(null)
      setSelectedSubCategory(null)
      setMenuItems([])
    } else {
      setSelectedSuperCategory(superCategory)
      setSelectedSubCategory(null)
      setMenuItems([])
    }
  }

  const handleSubCategoryClick = async (subCategory: string) => {
    try {
      if (selectedSubCategory === subCategory) {
        setSelectedSubCategory(null)
        setMenuItems([])
      } else {
        setSelectedSubCategory(subCategory)
        const items = await getMenuItemsByCategory(subCategory)
        setMenuItems(items)
      }
    } catch (error) {
      console.error("Error fetching items for subcategory:", error)
    }
  }

  const refreshItems = async (subCategory: string) => {
    const items = await getMenuItemsByCategory(subCategory)
    setMenuItems(items)
  }

  const handleOpenEditSuperCategory = (superCategory: string) => {
    setSelectedSuperCategoryForEdit(superCategory)
    setEditSuperCategoryModalOpen(true)
  }

  const handleOpenEditSubCategory = (subCategory: string) => {
    setSelectedSubCategoryForEdit(subCategory)
    setEditSubCategoryModalOpen(true)
  }

  const handleOpenEditItem = (item: MenuItem) => {
    setSelectedItem(item)
    setEditItemModalOpen(true)
  }

  return (
    <div className="inventory-container">
      {/* Header */}
      <header className="inventory-header">
        <div className="header-left">
          <LogoHeader />
        </div>
        <div className="header-center">
          <h1 className="inventory-title">Inventory</h1>
        </div>
        <div className="header-right"></div> {/* Empty for alignment */}
      </header>

      {/* ➕ Plus Button Below Line */}
      <div className="add-button-wrapper">
        <button
          className="add-button"
          title="Add new item/category"
          onClick={handleSaveNewItem}
        >
          ＋
        </button>
      </div>

      {/* Menu Items */}
      <div className="inventory-content">
        <div className="supercategories-column">
          {menuCategories.map((category) => (
            <div key={category.superCategory}>
              <button
                className="supercategory-button"
                onClick={() => handleSuperCategoryClick(category.superCategory)}
                onDoubleClick={() =>
                  handleOpenEditSuperCategory(category.superCategory)
                }
              >
                {category.superCategory}
              </button>

              {selectedSuperCategory === category.superCategory && (
                <div className="subcategory-list">
                  {category.subCategories.map((sub) => (
                    <div key={sub}>
                      <button
                        className="subcategory-button"
                        onClick={() => handleSubCategoryClick(sub)}
                        onDoubleClick={() => handleOpenEditSubCategory(sub)}
                      >
                        {sub}
                      </button>

                      {selectedSubCategory === sub && (
                        <div className="item-list">
                          {menuItems.length === 0 ? (
                            <p className="no-items">
                              No items in this subcategory.
                            </p>
                          ) : (
                            menuItems.map((item) => (
                              <div
                                key={item.itemId}
                                className="item-button"
                                onDoubleClick={() => handleOpenEditItem(item)}
                              >
                                {item.name} - £{item.price.toFixed(2)}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {modalOpen && (
        <AddItemModal
          onClose={() => setModalOpen(false)}
          onSave={handleSaveNewItem}
          superCategories={menuCategories.map((cat) => cat.superCategory)}
          subCategories={
            selectedSuperCategory
              ? menuCategories.find(
                  (c) => c.superCategory === selectedSuperCategory
                )?.subCategories || []
              : []
          }
        />
      )}

      {/* Add Item Modal */}
      {modalOpen && (
        <AddItemModal
          onClose={() => setModalOpen(false)}
          onSave={() => {
            setModalOpen(false)
            if (selectedSubCategory) refreshItems(selectedSubCategory)
          }}
          superCategories={menuCategories.map((cat) => cat.superCategory)}
          subCategories={
            selectedSuperCategory
              ? menuCategories.find(
                  (c) => c.superCategory === selectedSuperCategory
                )?.subCategories || []
              : []
          }
        />
      )}

      {/* Edit Item Modal */}
      {editItemModalOpen && selectedItem && (
        <EditItemModal
          item={selectedItem}
          categories={menuCategories}
          onClose={() => setEditItemModalOpen(false)}
          onSave={() => {
            setEditItemModalOpen(false)
            if (selectedSubCategory) refreshItems(selectedSubCategory)
          }}
        />
      )}

      {/* Edit Super Category Modal */}
      {editSuperCategoryModalOpen && selectedSuperCategoryForEdit && (
        <EditSuperCategoryModal
          oldSuperCategory={selectedSuperCategoryForEdit}
          onClose={() => setEditSuperCategoryModalOpen(false)}
          onSave={() => {
            setEditSuperCategoryModalOpen(false)
            window.location.reload()
          }}
        />
      )}

      {/* Edit Sub Category Modal */}
      {editSubCategoryModalOpen &&
        selectedSubCategoryForEdit &&
        selectedSuperCategory && (
          <EditSubCategoryModal
            currentSuperCategory={selectedSuperCategory}
            oldSubCategory={selectedSubCategoryForEdit}
            onClose={() => setEditSubCategoryModalOpen(false)}
            onSave={() => {
              setEditSubCategoryModalOpen(false)
              if (selectedSubCategory) refreshItems(selectedSubCategory)
            }}
          />
        )}
    </div>
  )
}

export default InventoryPage
