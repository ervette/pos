import { useEffect, useState } from "react"
import {
  getMenuCategories,
  getMenuItemsByCategory,
} from "../services/menu.service"
import { MenuCategory, MenuItem } from "../services/menu.service"
import LogoHeader from "../components/LogoHeader"
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
        <button className="add-button" title="Add new item/category">
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
                              <div key={item.itemId} className="item-button">
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
    </div>
  )
}

export default InventoryPage
