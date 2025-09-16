import { useFormik } from "formik";
import TextField from "../../atoms/textfield/textfield";
import { useNavigate } from "react-router-dom";
import { GetTeams, PostTeam, PutTeam, DeleteTeam } from "../../services/teams-service";
import { Team } from "../../objects/team";
import { useEffect, useState } from "react";

const AdminTeam = ()  =>
{
    const [teams, setTeams] = useState<Team[]>([]);
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
        } catch (error) {
            console.error('Error loading teams:', error);
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
                <h3>Team Management</h3>

                {/* Add New Team Form */}
                <div className="row mb-4" style={{backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px'}}>
                    <h5>Add New Team</h5>
                    <form onSubmit={formik.handleSubmit}>
                        <div className="row">
                            <div className="col-4">
                                <TextField label="Team Name" name="name" formik={formik}/>
                            </div>
                            <div className="col-2 d-flex align-items-end">
                                <button
                                    className="btn btn-primary me-2"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? 'Adding...' : 'Add Team'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Existing Teams Table */}
                <div className="row">
                    <div className="col-12">
                        <h5>Existing Teams</h5>
                        {teams.length === 0 ? (
                            <p>No teams found.</p>
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
                                        {teams.sort((a, b) => a.id - b.id).map(team => (
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

                {/* Back Button */}
                <div className="row mt-3">
                    <div className="col-12">
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate('/Admin')}
                        >
                            Back to Admin
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AdminTeam;