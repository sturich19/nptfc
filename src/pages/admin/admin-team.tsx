import { useFormik } from "formik";
import TextField from "../../atoms/textfield/textfield";
import { useNavigate } from "react-router-dom";
import { GetTeams, PostTeam, PutTeam, DeleteTeam } from "../../services/teams-service";
import { Team } from "../../objects/team";
import { useEffect, useState } from "react";

const AdminTeam = ()  =>
{
    const [teams, setTeams] = useState<Team[]>([]);
    const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const formik = useFormik({
        initialValues :{ name: ""},
        onSubmit : async values => {
            try {
                setLoading(true);
                const team : Team = {id : 0, name: values.name, isTigers : false, isLions : false, isPanthers : false }
                await PostTeam(team);
                formik.resetForm();
                loadTeams();
                alert('Team added successfully!');
            } catch (error) {
                alert('Error adding team. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    });

    const editFormik = useFormik({
        initialValues: { id: 0, name: "", isTigers: false, isLions: false, isPanthers: false },
        enableReinitialize: true,
        onSubmit: async values => {
            try {
                setLoading(true);
                await PutTeam(values);
                setEditingTeam(null);
                loadTeams();
                alert('Team updated successfully!');
            } catch (error) {
                alert('Error updating team. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    });

    const loadTeams = async () => {
        try {
            const data = await GetTeams();
            setTeams(data || []);
            setFilteredTeams(data || []);
        } catch (error) {
            console.error('Error loading teams:', error);
        }
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        if (value.trim() === '') {
            setFilteredTeams(teams);
        } else {
            const filtered = teams.filter(team =>
                team.name?.toLowerCase().includes(value.toLowerCase()) ||
                team.id.toString().includes(value)
            );
            setFilteredTeams(filtered);
        }
    };

    const handleEdit = (team: Team) => {
        setEditingTeam(team);
        editFormik.setValues({
            id: team.id,
            name: team.name || '',
            isTigers: team.isTigers,
            isLions: team.isLions,
            isPanthers: team.isPanthers
        });
    };

    const handleDelete = async (teamId: number, teamName: string) => {
        if (window.confirm(`Are you sure you want to delete "${teamName}"? This action cannot be undone.`)) {
            try {
                setLoading(true);
                await DeleteTeam(teamId);
                loadTeams();
                alert('Team deleted successfully!');
            } catch (error) {
                alert('Error deleting team. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleCancelEdit = () => {
        setEditingTeam(null);
        editFormik.resetForm();
    };

    useEffect(() => {
        loadTeams();
    }, []);

    return(
        <>
            <div className="container-fluid">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3>Team Management</h3>
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate('/Admin')}
                    >
                        Back to Admin
                    </button>
                </div>

                {/* Add New Team Form */}
                <div className="card mb-4">
                    <div className="card-header bg-success text-white">
                        <h5 className="mb-0">Add New Team</h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={formik.handleSubmit}>
                            <div className="row">
                                <div className="col-4">
                                    <TextField label="Team Name" name="name" formik={formik}/>
                                </div>
                                <div className="col-2 d-flex align-items-end">
                                    <button
                                        className="btn btn-success me-2"
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? 'Adding...' : 'Add Team'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Existing Teams Table */}
                <div className="row">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5>Existing Teams ({filteredTeams.length} of {teams.length})</h5>
                            <div className="col-4">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search teams by name or ID..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        {filteredTeams.length === 0 ? (
                            <p>{searchTerm ? `No teams found matching "${searchTerm}".` : 'No teams found.'}</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped table-bordered">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>ID</th>
                                            <th>Team Name</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTeams.sort((a, b) => a.id - b.id).map(team => (
                                            <tr key={team.id}>
                                                {editingTeam?.id === team.id ? (
                                                    // Edit Mode
                                                    <>
                                                        <td>{team.id}</td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={editFormik.values.name}
                                                                onChange={editFormik.handleChange}
                                                                name="name"
                                                            />
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="btn btn-success btn-sm me-1"
                                                                onClick={() => editFormik.handleSubmit()}
                                                                disabled={loading}
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                className="btn btn-secondary btn-sm"
                                                                onClick={handleCancelEdit}
                                                                disabled={loading}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </td>
                                                    </>
                                                ) : (
                                                    // View Mode
                                                    <>
                                                        <td>{team.id}</td>
                                                        <td>{team.name || ''}</td>
                                                        <td>
                                                            <button
                                                                className="btn btn-warning btn-sm me-1"
                                                                onClick={() => handleEdit(team)}
                                                                disabled={loading || editingTeam !== null}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => handleDelete(team.id, team.name || '')}
                                                                disabled={loading || editingTeam !== null}
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </>
    );
}

export default AdminTeam;