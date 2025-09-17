import { useFormik } from "formik";
import TextField from "../../atoms/textfield/textfield";
import { useNavigate } from "react-router-dom";
import { GetTeams, PostTeam, PutTeam, DeleteTeam } from "../../services/teams-service";
import { Team } from "../../objects/team";
import { useEffect, useState } from "react";
import { EditButton, DeleteButton, SaveButton, CancelButton } from "../../atoms/buttons/admin-action-buttons";

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
                {/* Modern Compact Header - Responsive */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-center mb-3 p-3 bg-light rounded">
                    <div className="text-center text-md-start mb-3 mb-md-0">
                        <h5 className="mb-0 text-success fw-bold">
                            <i className="bi bi-shield-shaded me-2"></i>
                            Team Management
                        </h5>
                        <small className="text-muted">
                            Add and manage teams in the system
                        </small>
                    </div>
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate('/Admin')}
                    >
                        <i className="bi bi-arrow-left me-1"></i>
                        Back to Admin
                    </button>
                </div>

                {/* Add New Team Form */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-light border-bottom">
                        <h6 className="mb-0 text-success fw-semibold">
                            <i className="bi bi-plus-square me-2"></i>
                            Add New Team
                        </h6>
                        <small className="text-muted">
                            Enter team name to add to the system
                        </small>
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
                <div className="card shadow-sm">
                    <div className="card-header bg-light border-bottom">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                            <div className="mb-2 mb-md-0">
                                <h6 className="mb-0 text-success fw-semibold">
                                    <i className="bi bi-list-ul me-2"></i>
                                    Existing Teams ({filteredTeams.length} of {teams.length})
                                </h6>
                                <small className="text-muted">
                                    Search and manage teams in the system
                                </small>
                            </div>
                            <div className="col-12 col-md-4">
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Search teams by name or ID..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="card-body p-0">
                        {filteredTeams.length === 0 ? (
                            <div className="text-center py-4 text-muted">
                                <i className="bi bi-search display-4"></i>
                                <p className="mt-2">{searchTerm ? `No teams found matching "${searchTerm}".` : 'No teams found.'}</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover table-condensed table-responsive table-sm mb-0">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Team Name</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="table-group-divider">
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
                                                            <SaveButton
                                                                onClick={() => editFormik.handleSubmit()}
                                                                loading={loading}
                                                                className="me-1"
                                                            />
                                                            <CancelButton
                                                                onClick={handleCancelEdit}
                                                                disabled={loading}
                                                            />
                                                        </td>
                                                    </>
                                                ) : (
                                                    // View Mode
                                                    <>
                                                        <td>{team.id}</td>
                                                        <td>{team.name || ''}</td>
                                                        <td>
                                                            <EditButton
                                                                onClick={() => handleEdit(team)}
                                                                disabled={loading || editingTeam !== null}
                                                                className="me-1"
                                                            />
                                                            <DeleteButton
                                                                onClick={() => handleDelete(team.id, team.name || '')}
                                                                disabled={loading || editingTeam !== null}
                                                            />
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