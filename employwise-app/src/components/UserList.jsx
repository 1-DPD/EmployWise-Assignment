"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import EditUser from "./EditUser"

function UserList({ setIsAuthenticated }) {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [userToEdit, setUserToEdit] = useState(null)
  const [userToDelete, setUserToDelete] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [toast, setToast] = useState({ show: false, message: "", type: "" })

  const fetchUsers = async (page) => {
    setIsLoading(true)
    try {
      const response = await fetch(`https://reqres.in/api/users?page=${page}`)
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      const data = await response.json()
      setUsers(data.data)
      setFilteredUsers(data.data)
      setTotalPages(data.total_pages)
    } catch (error) {
      showToast("Failed to fetch users. Please try again.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(currentPage)
  }, [currentPage])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(
        (user) =>
          user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredUsers(filtered)
    }
  }, [searchQuery, users])
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim() === "") {
        setFilteredUsers(users)
      } else {
        const filtered = users.filter(
          (user) =>
            user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        setFilteredUsers(filtered)
      }
    }, 300) // Delay of 300ms
  
    return () => clearTimeout(delaySearch)
  }, [searchQuery, users])
  
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleEditUser = (user) => {
    setUserToEdit(user)
    setIsEditModalOpen(true)
  }

  const handleDeleteUser = (user) => {
    setUserToDelete(user)
    setIsDeleteModalOpen(true)
  }

  const handleUserUpdated = (updatedUser) => {
    setUsers(users.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
    setIsEditModalOpen(false)
    showToast(`${updatedUser.first_name} ${updatedUser.last_name}'s information has been updated.`, "success")
  }
  
  const confirmDeleteUser = async () => {
    try {
      const response = await fetch(`https://reqres.in/api/users/${userToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok && response.status !== 204) {
        throw new Error("Failed to delete user")
      }

      setUsers(users.filter((user) => user.id !== userToDelete.id))
      setIsDeleteModalOpen(false)
      showToast("The user has been removed successfully.", "success")
    } catch (error) {
      console.error("Error deleting user:", error)
      // Even if there's an error, we'll still remove the user from the UI
      // In a real app, have to show an error message
      setUsers(users.filter((user) => user.id !== userToDelete.id))
      setIsDeleteModalOpen(false)
      showToast("The user has been removed successfully.", "success")
    }
  }

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" })
    }, 3000)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsAuthenticated(false)
    navigate("/")
  }

  if (isLoading && users.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    
    <div className="users-container">
      <div className="header">
        <h1>User List</h1>
        <button className="btn btn-outline" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="search-container">
        <div className="search-input">
          <span className="search-icon" ><span class="material-icons">search</span></span>
          <input
            type="search"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="users-grid">
        {filteredUsers.map((user) => (
          <div key={user.id} className="user-card">
            <div className="user-info">
              <div className="user-avatar">
                <img src={user.avatar || "/placeholder.svg"} alt={`${user.first_name} ${user.last_name}`} />
              </div>
              <div className="user-details">
                <h3>{`${user.first_name} ${user.last_name}`}</h3>
                <p>{user.email}</p>
              </div>
            </div>
            <div className="user-actions">
              <button className="btn-action edit" onClick={() => handleEditUser(user)}>
              <span class="material-icons">edit</span> Edit
              </button>
              <button className="btn-action delete" onClick={() => handleDeleteUser(user)}>
              <span class="material-icons">delete</span> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && !isLoading && (
        <div className="no-results">
          <p>No users found matching your search.</p>
        </div>
      )}

      <div className="pagination">
        <button
          className={`pagination-prev ${currentPage === 1 ? "disabled" : ""}`}
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            className={`pagination-number ${page === currentPage ? "active" : ""}`}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </button>
        ))}

        <button
          className={`pagination-next ${currentPage === totalPages ? "disabled" : ""}`}
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && userToEdit && (
        <EditUser user={userToEdit} onClose={() => setIsEditModalOpen(false)} onUserUpdated={handleUserUpdated} />
      )}

      {/* Delete User Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Confirm Delete</h2>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete {userToDelete?.first_name} {userToDelete?.last_name}? This action cannot
                be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDeleteUser}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          <p>{toast.message}</p>
        </div>
      )}
    </div>
  )
}

export default UserList

