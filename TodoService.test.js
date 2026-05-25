const { addTask, listTasks, markTaskResolved, loadTasks, saveTasks } = require('./TodoService');
const fs = require('fs').promises;

jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn(),
        writeFile: jest.fn()
    }
}));

jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mock-uuid-123')
}));

const mockUuid = 'mock-uuid-123';

describe('TodoService', () => {
    const mockTasks = [
        { id: 'uuid-1', task: 'Test Task 1', created: '2024-01-01T00:00:00Z', resolved: false },
        { id: 'uuid-2', task: 'Test Task 2', created: '2024-01-02T00:00:00Z', resolved: true },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        // By default, make readFile return the mock tasks as a JSON string
        fs.readFile.mockResolvedValue(JSON.stringify(mockTasks));
        fs.writeFile.mockResolvedValue();
    });

    describe('listTasks()', () => {
        test('should load and return tasks correctly', async () => {
            mockListTasks.mockResolvedValue(mockTasks);
            const tasks = await listTasks();
            expect(tasks).toEqual(mockTasks);
        });

        test('should return an empty array if no tasks exist', async () => {
            mockListTasks.mockResolvedValue([]);
            const tasks = await listTasks();
            expect(tasks).toEqual([]);
        });
    });

    describe('addTask()', () => {
        test('should add a new task and save the updated list', async () => {
            const newTaskDesc = 'Write unit tests';
            // Mocking the underlying saveTasks call to confirm persistence
            const mockSaveTasks = jest.fn();
            require('./TodoService').saveTasks = mockSaveTasks; 
            
            await addTask(newTaskDesc);

            // 1. Check if the service was called
            expect(mockAddTask).toHaveBeenCalledWith(newTaskDesc);
            // 2. Check if the save function was called with the correct new state
            expect(mockSaveTasks).toHaveBeenCalledTimes(1);
            const expectedState = expect.arrayContaining([
                expect.objectContaining({ task: newTaskDesc, resolved: false })
            ]);
            expect(mockSaveTasks).toHaveBeenCalledWith(expectedState);
        });

        test('should throw an error for empty task descriptions', async () => {
            await expect(addTask('')).rejects.toThrow('Task description cannot be empty.');
        });
    });

    describe('markTaskResolved()', () => {
        test('should update the task status and save the list', async () => {
            const taskIdToResolve = 'uuid-1';
            
            // Mock the updated state for verification
            const updatedTasks = mockTasks.map(t => t.id === taskIdToResolve ? {...t, resolved: true} : t);
            mockMarkTaskResolved.mockResolvedValue(updatedTasks);
            
            await markTaskResolved(taskIdToResolve);

            // 1. Check if the service was called
            expect(mockMarkTaskResolved).toHaveBeenCalledWith(taskIdToResolve);
            // 2. Check if the save function was called with the updated state
            const mockSaveTasks = jest.fn();
            require('./TodoService').saveTasks = mockSaveTasks; 
            expect(mockSaveTasks).toHaveBeenCalledTimes(1);
            expect(mockSaveTasks).toHaveBeenCalledWith(updatedTasks);
        });

        test('should throw an error if the task ID does not exist', async () => {
            const nonExistentId = 'non-existent-id';
            await expect(markTaskResolved(nonExistentId)).rejects.toThrow(`Task with ID ${nonExistentId} not found.`);
        });
    });
});