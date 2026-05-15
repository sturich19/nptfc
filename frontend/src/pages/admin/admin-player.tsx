import { useFormik } from "formik";
import TextField from "../../atoms/textfield/textfield";
import { useNavigate } from "react-router-dom";
import { PostPlayer, GetPlayers, PutPlayer, DeletePlayer } from "../../services/player-service";
import { Player } from "../../objects/player";
import { Position } from "../../objects/enums/enums";
import { useState, useEffect } from "react";
import { EditButton, DeleteButton, CancelButton } from "../../atoms/buttons/admin-action-buttons";

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
            {/* Modern Compact Header - Responsive */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-center mb-3 p-3 bg-light rounded">
                <div className="text-center text-md-start mb-3 mb-md-0">
                    <h5 className="mb-0 text-success fw-bold">
                        <i className="bi bi-people me-2"></i>
                        {isEditMode ? 'Edit Player' : 'Player Management'}
                    </h5>
                    <small className="text-muted">
                        {isEditMode ? 'Update player information' : 'Add and manage players in the system'}
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

            {/* Add/Edit Player Section */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-light border-bottom">
                    <h6 className="mb-0 text-success fw-semibold">
                        <i className="bi bi-person-plus me-2"></i>
                        {isEditMode ? 'Edit Player' : 'Add New Player'}
                    </h6>
                    <small className="text-muted">
                        {isEditMode ? 'Update player details below' : 'Enter player information to add them to the system'}
                    </small>
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
                                <CancelButton onClick={handleCancelEdit} />
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
            <div className="card shadow-sm">
                <div className="card-header bg-light border-bottom d-flex justify-content-between align-items-center">
                    <div>
                        <h6 className="mb-0 text-success fw-semibold">
                            <i className="bi bi-people-fill me-2"></i>
                            Existing Players
                        </h6>
                        <small className="text-muted">
                            Click edit to modify player information
                        </small>
                    </div>
                    <span className="badge bg-success">{existingPlayers.length} players</span>
                </div>
                <div className="card-body p-0">
                    {existingPlayers.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-hover table-condensed table-responsive table-sm mb-0">
                                <thead>
                                    <tr>
                                        <th className="ps-3">Name</th>
                                        <th>Nickname</th>
                                        <th>Position</th>
                                        <th>Shirt #</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="table-group-divider">
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
                                                    <EditButton onClick={() => handleEditPlayer(player)} />
                                                    <DeleteButton onClick={() => handleDeletePlayer(player.id)} />
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