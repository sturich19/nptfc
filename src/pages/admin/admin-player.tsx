import { useFormik } from "formik";
import TextField from "../../atoms/textfield/textfield";
import { useNavigate } from "react-router-dom";
import { PostPlayer, GetPlayers, PutPlayer, DeletePlayer } from "../../services/player-service";
import { Player } from "../../objects/player";
import { Position } from "../../objects/enums/enums";
import { useState, useEffect } from "react";

const AdminPlayer = ()  =>
{
    const navigate = useNavigate();
    const [existingPlayers, setExistingPlayers] = useState<Player[]>([]);
    const [feedback, setFeedback] = useState<{message: string, type: 'success' | 'error'} | null>(null);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

    const positions = Object.entries(Position).map(([key, value]) => ({key, value}));
    const filteredPositionOptions = positions.filter(option => !isNaN(Number(option.key)))

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const players = await GetPlayers();
                setExistingPlayers(players || []);
            } catch (error) {
                console.error("Error fetching existing players:", error);
            }
        };
        fetchPlayers();
    }, []);

    const formik = useFormik({
        initialValues :{ firstname: "", surname: "", position : 0, nickname : "", shirt : 0},
        onSubmit : async values => {
            const player : Player = {
                id : isEditMode ? selectedPlayer?.id || 0 : 0,
                firstname: values.firstname,
                surname: values.surname,
                position : parseInt(values.position.toString()),
                nickname : values.nickname,
                shirt : values.shirt
            }

            try {
                if (isEditMode) {
                    await PutPlayer(player);
                    setFeedback({message: 'Player updated successfully!', type: 'success'});
                } else {
                    await PostPlayer(player);
                    setFeedback({message: 'Player added successfully!', type: 'success'});
                }

                formik.resetForm();
                setIsEditMode(false);
                setSelectedPlayer(null);

                const players = await GetPlayers();
                setExistingPlayers(players || []);

                setTimeout(() => setFeedback(null), 3000);
            } catch (error) {
                console.error(`Error ${isEditMode ? 'updating' : 'adding'} player:`, error);
                setFeedback({message: `Error ${isEditMode ? 'updating' : 'adding'} player. Please try again.`, type: 'error'});
                setTimeout(() => setFeedback(null), 3000);
            }
        }
    });

    const handleEditPlayer = (player: Player) => {
        setSelectedPlayer(player);
        setIsEditMode(true);
        formik.setValues({
            firstname: player.firstname || '',
            surname: player.surname || '',
            position: player.position,
            nickname: player.nickname || '',
            shirt: player.shirt
        });
    };

    const handleDeletePlayer = async (playerId: number) => {
        if (window.confirm('Are you sure you want to delete this player?')) {
            try {
                await DeletePlayer(playerId);
                setFeedback({message: 'Player deleted successfully!', type: 'success'});

                const players = await GetPlayers();
                setExistingPlayers(players || []);

                setTimeout(() => setFeedback(null), 3000);
            } catch (error) {
                console.error("Error deleting player:", error);
                setFeedback({message: 'Error deleting player. Please try again.', type: 'error'});
                setTimeout(() => setFeedback(null), 3000);
            }
        }
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        setSelectedPlayer(null);
        formik.resetForm();
    };

    const getPositionBadgeColor = (position: number) => {
        switch (position) {
            case Position.GK: // Goalkeeper
                return 'bg-warning text-dark';
            case Position.Defender:
                return 'bg-primary';
            case Position.Midfielder:
                return 'bg-success';
            case Position.Striker:
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    };

    return(
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>{isEditMode ? 'Edit Player' : 'Player Management'}</h3>
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/Admin')}
                >
                    Back to Admin
                </button>
            </div>

            {/* Add/Edit Player Section */}
            <div className="card mb-4">
                <div className="card-header bg-success text-white">
                    <h4 className="mb-0">{isEditMode ? 'Edit Player' : 'Add New Player'}</h4>
                </div>
                <div className="card-body">
                    {feedback && (
                        <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`} role="alert">
                            {feedback.message}
                        </div>
                    )}

                    <form onSubmit={formik.handleSubmit}>
                        <div className="row g-4 mb-4">
                            <div className="col-md-2">
                                <TextField label="First Name" name="firstname" formik={formik}/>
                            </div>
                            <div className="col-md-2">
                                <TextField label="Surname" name="surname" formik={formik}/>
                            </div>
                            <div className="col-md-2">
                                <TextField label="Nickname" name="nickname" formik={formik}/>
                            </div>                        
                            <div className="col-md-2">
                                <label htmlFor="position" className="form-label fw-semibold">Position</label>
                                <select id="position" className="form-select" {...formik.getFieldProps("position")}>
                                    {filteredPositionOptions?.map(option => (
                                        <option key={option.key} value={option.key}>{option.value}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-2">
                            <TextField label="Shirt Number" name="shirt" formik={formik}/>
                        </div>                        
                        </div>                        
                        

                        <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                            {isEditMode && (
                                <button className="btn btn-outline-secondary" type="button" onClick={handleCancelEdit}>
                                    <i className="bi bi-x-circle me-1"></i>Cancel
                                </button>
                            )}
                            <button className="btn btn-success" type="submit">
                                <i className={`bi ${isEditMode ? 'bi-check-circle' : 'bi-plus-circle'} me-1`}></i>
                                {isEditMode ? 'Update Player' : 'Add Player'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Existing Players Section */}
            <div className="card">
                <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">Existing Players</h4>
                    <span className="badge bg-light text-dark">{existingPlayers.length} players</span>
                </div>
                <div className="card-body p-0">
                    {existingPlayers.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered mb-0">
                                <thead className="table-dark">
                                    <tr>
                                        <th className="ps-3">Name</th>
                                        <th>Nickname</th>
                                        <th>Position</th>
                                        <th>Shirt #</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {existingPlayers
                                        .sort((a, b) => a.shirt - b.shirt)
                                        .map((player, index) => (
                                        <tr key={player.id} className={isEditMode && selectedPlayer?.id === player.id ? 'table-warning' : ''}>
                                            <td className="ps-3">
                                                <strong>{player.firstname} {player.surname}</strong>
                                            </td>
                                            <td>
                                                <span className="text-muted fst-italic">
                                                    {player.nickname || '-'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${getPositionBadgeColor(player.position)}`}>
                                                    {Position[player.position]}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="badge bg-dark rounded-pill">
                                                    #{player.shirt}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <div className="d-flex gap-2 justify-content-center">
                                                    <button
                                                        className="btn btn-outline-success btn-sm"
                                                        onClick={() => handleEditPlayer(player)}
                                                    >
                                                        <i className="bi bi-pencil me-1"></i>Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={() => handleDeletePlayer(player.id)}
                                                    >
                                                        <i className="bi bi-trash me-1"></i>Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-5 text-muted">
                            <i className="bi bi-people display-4"></i>
                            <p className="mt-2">No players found. Add your first player above!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminPlayer;